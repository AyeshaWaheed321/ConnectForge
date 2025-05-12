import asyncio
import logging
from venv import logger
from rest_framework import serializers

from .utils import get_tools
from .models import AgentActivityLog, AgentConfig, AgentMetric, LLMConfig, Tool

logger  = logging.getLogger(__name__)
class LLMConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMConfig
        exclude = ('api_key',)


class PromptSerializer(serializers.Serializer):
    system_message = serializers.CharField()


class AgentConfigCoreSerializer(serializers.ModelSerializer):
    llm = LLMConfigSerializer()
    prompt = PromptSerializer(write_only=True)
    tags = serializers.ListField(child=serializers.CharField(), default=list)
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = AgentConfig
        fields = ('id', 'agent_name', 'description', 'tags', 'llm', 'prompt')

class AgentConfigWrapperSerializer(serializers.Serializer):
    agentConfig = AgentConfigCoreSerializer()
    mcpServers = serializers.JSONField()

    def create(self, validated_data):
        agent_data = validated_data.get('agentConfig')
        mcp_servers = validated_data.get('mcpServers')

        llm_data = agent_data.pop('llm')
        prompt_data = agent_data.pop('prompt')

        llm_config = LLMConfig.objects.create(**llm_data)

        agent = AgentConfig.objects.create(
            llm=llm_config,
            system_message=prompt_data['system_message'],
            mcp_server=mcp_servers,
            **agent_data
        )

        tools = asyncio.run(get_tools(mcp_servers))

        for tool in tools:
            Tool.objects.create(agent=agent, name=tool.name, description=tool.description)

        return agent

    def update(self, instance, validated_data):
        agent_data = validated_data.get('agentConfig', {})
        new_mcp_servers = validated_data.get('mcpServers', instance.mcp_server)

        llm_data = agent_data.pop('llm', {})
        prompt_data = agent_data.pop('prompt', {})

        # Update LLMConfig
        for attr, value in llm_data.items():
            setattr(instance.llm, attr, value)
        instance.llm.save()

        # Update AgentConfig fields
        for attr, value in agent_data.items():
            setattr(instance, attr, value)

        if "system_message" in prompt_data:
            instance.system_message = prompt_data["system_message"]

        # Detect if mcp_server keys have changed
        old_keys = set(instance.mcp_server.keys() if instance.mcp_server else [])
        new_keys = set(new_mcp_servers.keys() if new_mcp_servers else [])
        mcp_keys_changed = old_keys != new_keys

        instance.mcp_server = new_mcp_servers
        instance.save()

        # Regenerate tools only if keys changed
        if mcp_keys_changed:
            Tool.objects.filter(agent=instance).delete()
            tools = asyncio.run(get_tools(new_mcp_servers))
            for tool in tools:
                Tool.objects.create(agent=instance, name=tool.name, description=tool.description)

        return instance


class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = ['name', 'description']

class AgentActivityLogSerializer(serializers.ModelSerializer):
    agent = serializers.SerializerMethodField()
    class Meta:
        model = AgentActivityLog
        fields = ['id', 'agent', 'action', 'timestamp', 'description', 'metadata']

    def get_agent(self, obj):
        return obj.agent.agent_name if obj.agent else None

class AgentMetricSerializer(serializers.ModelSerializer):
    average_response_time = serializers.SerializerMethodField()

    class Meta:
        model = AgentMetric
        fields = [
            'id', 'agent', 'date',
            'total_requests', 'total_success', 'total_failures',
            'total_response_time_ms', 'average_response_time',
        ]

    def get_average_response_time(self, obj):
        return obj.average_response_time()