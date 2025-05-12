import asyncio
import logging
import os
import json
import time
import uuid
from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from django.db.models import Sum, Count

from .mcp.client import agent_executor

from .utils import get_tools, log_activity, update_metrics

from .models import ActivityEvents, AgentActivityLog, AgentConfig, AgentMetric, ChatHistory, Tool

from .serializers import AgentActivityLogSerializer, AgentConfigCoreSerializer, AgentConfigWrapperSerializer, AgentMetricSerializer, ToolSerializer
import json
from drf_yasg import openapi
from rest_framework.decorators import api_view

logger = logging.getLogger(__name__)

class SampleAgentConfigView(APIView):
    def get(self, request):
        try:
            file_path = os.path.join(settings.BASE_DIR, 'app', 'config_template', 'sample_config.json')
            with open(file_path, 'r') as f:
                data = json.load(f)
            return Response(data, status=status.HTTP_200_OK)
        except FileNotFoundError:
            return Response({"error": "Sample agent config not found."}, status=status.HTTP_404_NOT_FOUND)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AgentConfigViewSet(viewsets.ModelViewSet):
    queryset = AgentConfig.objects.all()
    serializer_class = AgentConfigWrapperSerializer

    @swagger_auto_schema(
        operation_summary="List all registered agents",
        operation_description="Returns a list of all AI agent configurations.",
        responses={200: openapi.Response("List of agents")}
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = [{
            "id": agent.id,
            "agent_name": agent.agent_name,
            "description": agent.description,
            "tool_names": [tool.name for tool in agent.tools.all()],
        } for agent in queryset]
        return Response(data)

    @swagger_auto_schema(
        operation_summary="Retrieve an agent",
        operation_description="Get detailed info about a specific agent by ID, wrapped in agentConfig/mcpServers format."
    )
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        agent_core_data = AgentConfigCoreSerializer(instance).data

        response_data = {
            "agentConfig": agent_core_data,
            "mcpServers": instance.mcp_server,
            "tool_names": [tool.name for tool in instance.tools.all()]
        }
        return Response(response_data)

    @swagger_auto_schema(
        operation_summary="Register a new agent",
        operation_description="Creates a new AI agent and generates its tools based on MCP config.",
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                agent = serializer.save()
                tools = Tool.objects.filter(agent=agent)
                tool_data = ToolSerializer(tools, many=True).data

                log_activity(
                    agent=agent,
                    action=ActivityEvents.AGENT_CREATED,
                    description="Agent successfully created.",
                    metadata={"agent_id": str(agent.id)}
                )

                return Response({
                    "message": "Agent registered successfully",
                    "agent_name": agent.agent_name,
                    "id": str(agent.id),
                    "description": agent.description,
                    "tools": tool_data
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                log_activity(
                    agent=None,
                    action=ActivityEvents.ERROR_OCCURRED,
                    description="Agent creation failed.",
                    metadata={"error": str(e)}
                )
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Update an agent",
        operation_description="Update all fields of an agent configuration.",
    )
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            try:
                agent = serializer.save()
                tools = Tool.objects.filter(agent=agent)
                tool_data = ToolSerializer(tools, many=True).data

                log_activity(
                    agent=agent,
                    action=ActivityEvents.AGENT_MODIFIED,
                    description="Agent configuration updated.",
                    metadata={"agent_id": str(agent.id)}
                )

                return Response({
                    "message": "Agent updated successfully",
                    "agent_name": agent.agent_name,
                    "id": str(agent.id),
                    "description": agent.description,
                    "tools": tool_data
                }, status=status.HTTP_200_OK)

            except Exception as e:
                log_activity(
                    agent=instance,
                    action=ActivityEvents.ERROR_OCCURRED,
                    description="Agent update failed.",
                    metadata={"error": str(e)}
                )
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Partially update an agent",
        operation_description="Update one or more fields of an agent without replacing the whole config.",
    )
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        agent_id = str(instance.id)
        agent_name = instance.agent_name
        try:
            response = super().destroy(request, *args, **kwargs)

            log_activity(
                agent=None,  # Agent is deleted, can't FK it
                action=ActivityEvents.AGENT_DELETED,
                description=f"Agent '{agent_name}' deleted.",
                metadata={"agent_id": agent_id}
            )

            return response
        except Exception as e:
            log_activity(
                agent=None,
                action=ActivityEvents.ERROR_OCCURRED,
                description=f"Deletion failed for agent '{agent_name}'.",
                metadata={"error": str(e), "agent_id": agent_id}
            )
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)   

class ExtendMCPServersView(APIView):
    """
    Add custom MCP servers for an existing agent to register new tools and extend the functionality.
    """

    @swagger_auto_schema(
        operation_summary="Extend MCP servers",
        operation_description="Add custom MCP servers for an existing agent to register new tools and extend the functionality.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'mcpServers': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='Dictionary of new MCP server configurations'
                )
            },
            required=['mcpServers']
        ),
        responses={
            200: openapi.Response(description="MCP servers extended and tools registered"),
            400: openapi.Response(description="Invalid input"),
            404: openapi.Response(description="Agent not found"),
            500: openapi.Response(description="Internal server error"),
        }
    )
    def post(self, request, id):
        new_mcp_servers = request.data.get("mcpServers", {})

        if not isinstance(new_mcp_servers, dict):
            return Response({"error": "mcpServers must be a dictionary"}, status=status.HTTP_400_BAD_REQUEST)

        agent = get_object_or_404(AgentConfig, id=id)

        existing_mcp_servers = agent.mcp_server or {}
        merged_mcp_servers = {**existing_mcp_servers, **new_mcp_servers}
        agent.mcp_server = merged_mcp_servers
        agent.save()

        existing_tool_names = set(Tool.objects.filter(agent=agent).values_list('name', flat=True))

        try:
            new_tools = asyncio.run(get_tools(new_mcp_servers))

            new_tool_instances = []
            duplicate_names = []

            for tool in new_tools:
                if tool.name in existing_tool_names:
                    duplicate_names.append(tool.name)
                    continue

                tool_instance = Tool.objects.create(
                    agent=agent,
                    name=tool.name,
                    description=tool.description
                )
                new_tool_instances.append(tool_instance)

            serialized = ToolSerializer(new_tool_instances, many=True)
            response = {
                "message": "MCP servers extended successfully.",
                "new_tools_registered": serialized.data
            }

            if duplicate_names:
                response["skipped_duplicates"] = duplicate_names

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(
    method='post',
    operation_description="Chat with a specific AI agent using LangChain + LLM Provider to use the agent's tools.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['message', 'agent_id'],
        properties={
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='User input message'),
            'agent_id': openapi.Schema(type=openapi.TYPE_STRING, description='UUID of the agent'),
        },
    ),
    responses={
        200: openapi.Response(description='AI Response', schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'response': openapi.Schema(type=openapi.TYPE_STRING)},
        )),
        400: openapi.Response(description='Bad request'),
        404: openapi.Response(description='Agent not found'),
        500: openapi.Response(description='Internal server error'),
    }
)
@api_view(["POST"])
def chat(request):
    user_message = request.data.get("message", "")
    agent_id = request.data.get("agent_id")

    if not agent_id:
        return Response({"error": "agent_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        return Response({"error": "Invalid UUID format for agent_id."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent = AgentConfig.objects.select_related("llm").get(id=agent_uuid)
        start_time = time.time()

        response = agent_executor(user_message, agent)

        duration_ms = int((time.time() - start_time) * 1000)

        if "error" in response:
            logger.error(f"[{agent.agent_name}] Agent execution error: {response['error']}")
            log_activity(
                agent=agent,
                action=ActivityEvents.ERROR_OCCURRED,
                description=f"Error during agent execution: {response['error']}",
                metadata={"response": response['error'], "duration_ms": duration_ms}
            )
            update_metrics(agent, success=False, response_time_ms=duration_ms)
            return Response({"error": response['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        log_activity(
            agent=agent,
            action=ActivityEvents.CHAT_ENDED,
            description="Successfully exited chat with agent",
            metadata={"duration_ms": duration_ms}
        )
        update_metrics(agent, success=True, response_time_ms=duration_ms)
        return Response({"response": response["output"]}, status=status.HTTP_200_OK)

    except AgentConfig.DoesNotExist:
        return Response({"error": f"Agent with id {agent_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Unexpected error in chat view")
        return Response({"error": "Something went wrong, please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

@swagger_auto_schema(
    method='get',
    operation_description="Retrieve the chat history of a specific AI agent.",
    manual_parameters=[
        openapi.Parameter(
            'agent_id', openapi.IN_QUERY, description="UUID of the agent",
            type=openapi.TYPE_STRING, required=True
        ),
        openapi.Parameter(
            'page', openapi.IN_QUERY, description="Page number for pagination",
            type=openapi.TYPE_INTEGER, required=False
        ),
        openapi.Parameter(
            'page_size', openapi.IN_QUERY, description="Number of records per page",
            type=openapi.TYPE_INTEGER, required=False
        ),
    ],
    responses={
        200: openapi.Response(
            description='Chat history',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'next': openapi.Schema(type=openapi.FORMAT_URI),
                    'previous': openapi.Schema(type=openapi.FORMAT_URI),
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'message': openapi.Schema(type=openapi.TYPE_STRING),
                                'role': openapi.Schema(type=openapi.TYPE_STRING),
                                'timestamp': openapi.Schema(type=openapi.FORMAT_DATETIME),
                            }
                        )
                    )
                }
            )
        ),
        400: openapi.Response(description='Bad request'),
        404: openapi.Response(description='Agent not found'),
    }
)
@api_view(["GET"])
def chat_history(request):
    agent_id = request.GET.get("agent_id")

    if not agent_id:
        return Response({"error": "agent_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        return Response({"error": "Invalid UUID format for agent_id."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent = AgentConfig.objects.get(id=agent_uuid)
    except AgentConfig.DoesNotExist:
        return Response({"error": f"Agent with id {agent_id} not found."}, status=status.HTTP_404_NOT_FOUND)

    queryset = ChatHistory.objects.filter(agent=agent).order_by("timestamp", "role_order")

    paginator = CustomPagination()
    paginated_qs = paginator.paginate_queryset(queryset, request)

    paginated_qs = paginated_qs or []

    serialized = [
        {
            "message": entry.message,
            "role": entry.role,
            "timestamp": entry.timestamp,
        }
        for entry in paginated_qs
    ]
    return paginator.get_paginated_response(serialized)

@swagger_auto_schema(
    method='delete',
    operation_description="Delete the chat history of a specific AI agent.",
    manual_parameters=[
        openapi.Parameter(
            'agent_id', openapi.IN_QUERY, description="UUID of the agent",
            type=openapi.TYPE_STRING, required=True
        ),
    ],
    responses={
        200: openapi.Response(description="Chat history deleted successfully."),
        400: openapi.Response(description="Bad request"),
        404: openapi.Response(description="Agent not found"),
    }
)
@api_view(["DELETE"])
def delete_chat_history(request):
    agent_id = request.GET.get("agent_id")

    if not agent_id:
        return Response({"error": "agent_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        return Response({"error": "Invalid UUID format for agent_id."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        agent = AgentConfig.objects.get(id=agent_uuid)
    except AgentConfig.DoesNotExist:
        return Response({"error": f"Agent with id {agent_id} not found."}, status=status.HTTP_404_NOT_FOUND)

    # Delete the chat history related to the agent
    try:
        ChatHistory.objects.filter(agent=agent).delete()

        # Log the deletion activity
        log_activity(
            agent=agent,
            action=ActivityEvents.CHAT_DELETED,
            description=f"Chat history for agent '{agent.agent_name}' deleted.",
            metadata={"agent_id": str(agent.id)}
        )

        return Response({"message": "Chat history deleted successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        log_activity(
            agent=agent,
            action=ActivityEvents.ERROR_OCCURRED,
            description="Failed to delete chat history.",
            metadata={"error": str(e)}
        )
        return Response({"error": f"Error occurred while deleting chat history: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class RecentActivityLogsView(generics.ListAPIView):
    queryset = AgentActivityLog.objects.order_by('-timestamp')
    serializer_class = AgentActivityLogSerializer
    pagination_class = CustomPagination

    @swagger_auto_schema(
        operation_description="Get a paginated list of recent agent activity logs (ordered by timestamp).",
        responses={200: AgentActivityLogSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class AgentMetricsView(APIView):

    @swagger_auto_schema(
        operation_description="Get summary metrics for all agents including total requests, average response time, total successes, and total failures.",
        responses={200: openapi.Response(
            description="Summary metrics",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'total_agents': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'total_success': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'total_failures': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'average_response_time': openapi.Schema(type=openapi.TYPE_NUMBER, format='float'),
                }
            )
        )}
    )
    def get(self, request):
        # Correct: count all AgentConfig instances
        total_agents = AgentConfig.objects.count()

        # Aggregate metrics from AgentMetric
        summary = AgentMetric.objects.aggregate(
            total_requests=Sum('total_requests'),
            total_success=Sum('total_success'),
            total_failures=Sum('total_failures'),
            total_response_time=Sum('total_response_time_ms'),
        )

        total_requests = summary['total_requests'] or 0
        avg_response_time = (
            summary['total_response_time'] / total_requests
            if total_requests else 0
        )

        return Response({
            'total_agents': total_agents,
            'total_success': summary['total_success'] or 0,
            'total_failures': summary['total_failures'] or 0,
            'average_response_time': round(avg_response_time, 2),
        })
