from rest_framework import serializers
from .models import (
    AgentConfig, AgentTag, AgentPersonality, AgentNode,
    NodeConfiguration, ChatSettings, InitialMessage, ChatPrompt
)


class AgentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentTag
        fields = ['tag']


class AgentPersonalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentPersonality
        fields = ['text']


class AgentNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentNode
        fields = ['node_type']


class NodeConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NodeConfiguration
        exclude = ['agent', 'node_type']


class NodeConfigDictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        validated = {}
        for node_type, config in data.items():
            config_data = NodeConfigurationSerializer(data=config)
            config_data.is_valid(raise_exception=True)
            validated[node_type] = config_data.validated_data
        return validated

    def to_representation(self, obj):
        return {
            config.node_type: NodeConfigurationSerializer(config).data
            for config in obj
        }


class InitialMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InitialMessage
        fields = ['message']

    def to_internal_value(self, data):
        if isinstance(data, str):
            return {'message': data}
        return super().to_internal_value(data)


class ChatPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatPrompt
        fields = ['prompt']

    def to_internal_value(self, data):
        if isinstance(data, str):
            return {'prompt': data}
        return super().to_internal_value(data)


class ChatSettingsSerializer(serializers.ModelSerializer):
    initial_messages = InitialMessageSerializer(many=True)
    chat_prompts = ChatPromptSerializer(many=True)

    class Meta:
        model = ChatSettings
        fields = ['history_policy', 'history_length', 'initial_messages', 'chat_prompts']

    def create(self, validated_data):
        initial_messages = validated_data.pop('initial_messages', [])
        chat_prompts = validated_data.pop('chat_prompts', [])
        chat_settings = ChatSettings.objects.create(**validated_data)

        for msg in initial_messages:
            InitialMessage.objects.create(chat_settings=chat_settings, **msg)
        for prompt in chat_prompts:
            ChatPrompt.objects.create(chat_settings=chat_settings, **prompt)

        return chat_settings


class AgentConfigSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), write_only=True)
    personality = serializers.ListField(child=serializers.CharField(), write_only=True)
    nodes = serializers.ListField(child=serializers.CharField(), write_only=True)
    node_configurations = NodeConfigDictSerializer(write_only=True)
    chat_settings = ChatSettingsSerializer(write_only=True)
    options = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = AgentConfig
        fields = [
            'version', 'agent_id', 'name', 'description',
            'tags', 'priority', 'personality', 'nodes',
            'node_configurations', 'chat_settings', 'options'
        ]

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        personalities = validated_data.pop('personality', [])
        nodes = validated_data.pop('nodes', [])
        node_configs = validated_data.pop('node_configurations', {})
        chat_settings_data = validated_data.pop('chat_settings', {})
        options = validated_data.pop('options', {})

        max_steps = options.get('max_steps') if options else None
        validated_data['max_steps'] = max_steps

        agent = AgentConfig.objects.create(**validated_data)

        AgentTag.objects.bulk_create([
            AgentTag(agent=agent, tag=tag) for tag in tags
        ])
        AgentPersonality.objects.bulk_create([
            AgentPersonality(agent=agent, text=text) for text in personalities
        ])
        AgentNode.objects.bulk_create([
            AgentNode(agent=agent, node_type=node) for node in nodes
        ])
        for node_type, config_data in node_configs.items():
            NodeConfiguration.objects.create(agent=agent, node_type=node_type, **config_data)

        chat_settings_data['agent'] = agent
        ChatSettingsSerializer().create(chat_settings_data)

        return agent
