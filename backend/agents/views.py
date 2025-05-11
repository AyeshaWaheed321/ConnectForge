import asyncio
import logging
import os
import json
import uuid
from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets

from .mcp_agent import agent_executor

from .utils import get_tools

from .models import AgentConfig, LLMConfig, LLMProvider, Tool

from .serializers import AgentConfigCoreSerializer, AgentConfigWrapperSerializer, ToolSerializer
import json
from drf_yasg import openapi
from rest_framework.decorators import api_view

logger = logging.getLogger(__name__)

class SampleAgentConfigView(APIView):
    def get(self, request):
        try:
            file_path = os.path.join(settings.BASE_DIR, 'agents', 'config_template', 'sample_config.json')
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

                return Response({
                    "message": "Agent registered successfully",
                    "agent_name": agent.agent_name,
                    "id": str(agent.id),
                    "description": agent.description,
                    "tools": tool_data
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
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

                return Response({
                    "message": "Agent updated successfully",
                    "agent_name": agent.agent_name,
                    "id": str(agent.id),
                    "description": agent.description,
                    "tools": tool_data
                }, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Partially update an agent",
        operation_description="Update one or more fields of an agent without replacing the whole config.",
    )
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete an agent",
        operation_description="Removes the agent configuration and its associated tools.",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
class ExtendMCPServersView(APIView):
    """
    Add new MCP servers to an existing agent's configuration and return newly registered tools.
    Ensures no duplicate tool names are added to an agent.
    """

    @swagger_auto_schema(
        operation_summary="Extend MCP servers",
        operation_description="Adds new MCP server configs to an existing agent and registers new tools.",
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
    operation_description="Chat with a specific AI agent using LangChain + Groq with configured tools",
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
            properties={
                'response': openapi.Schema(type=openapi.TYPE_STRING),
            },
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

        mcp_servers = agent.mcp_server or {}
        llm_config = agent.llm

        agent_llm_dict = {
            "provider": llm_config.provider,
            "model": llm_config.model,
            "api_key": llm_config.api_key,
            "max_tokens": llm_config.max_tokens,
            "temperature": llm_config.temperature,
            "timeout": llm_config.timeout,
            "max_retries": llm_config.max_retries,
            "system_message": agent.system_message,
            "n_messages": agent.n_messages,
        }

        response = agent_executor(user_message, mcp_servers, agent_llm_dict)

        return Response({"response": response["output"]}, status=status.HTTP_200_OK)

    except AgentConfig.DoesNotExist:
        return Response({"error": f"Agent with id {agent_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SetLLMApiKeyView(APIView):
    """
    Set or update API key for a specific LLM provider.
    """

    @swagger_auto_schema(
        operation_summary="Set LLM API key",
        operation_description="Sets or updates an API key for a specified LLM provider and model.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "provider": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=[choice[0] for choice in LLMProvider.choices],
                    description="LLM provider (e.g., openai, groq, ...)"
                ),
                "api_key": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="API key for the LLM provider"
                ),
                "model": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Model name (optional, default: 'default-model')"
                ),
            },
            required=["provider", "api_key"]
        ),
        responses={
            200: openapi.Response(description="API key saved or updated successfully"),
            400: openapi.Response(description="Invalid input"),
        }
    )
    def post(self, request):
        provider = request.data.get("provider")
        api_key = request.data.get("api_key")
        model = request.data.get("model", "default-model")

        if not provider or not api_key:
            return Response(
                {"error": "Both 'provider' and 'api_key' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if provider not in LLMProvider.values:
            return Response(
                {"error": f"Invalid provider '{provider}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        _, created = LLMConfig.objects.update_or_create(
            provider=provider,
            model=model,
            defaults={"api_key": api_key}
        )

        return Response({
            "message": "API key saved successfully.",
            "provider": provider,
            "model": model,
            "created": created,
        }, status=status.HTTP_200_OK)