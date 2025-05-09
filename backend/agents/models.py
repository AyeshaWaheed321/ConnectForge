import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField

class AgentConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.CharField(max_length=10, null=True, blank=True)
    agent_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.IntegerField(null=True, blank=True)
    max_steps = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class AgentTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, related_name='tags', on_delete=models.CASCADE)
    tag = models.CharField(max_length=50)


class AgentPersonality(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, related_name='personalities', on_delete=models.CASCADE)
    text = models.TextField()


class AgentNode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, related_name='nodes', on_delete=models.CASCADE)
    node_type = models.CharField(max_length=100)


class NodeConfiguration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, related_name='node_configurations', on_delete=models.CASCADE)
    node_type = models.CharField(max_length=100)
    model = models.CharField(max_length=100, null=True, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    max_tokens = models.IntegerField(null=True, blank=True)
    top_p = models.FloatField(null=True, blank=True)
    top_k = models.IntegerField(null=True, blank=True)
    frequency_penalty = models.FloatField(null=True, blank=True)
    presence_penalty = models.FloatField(null=True, blank=True)
    stop_sequences = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    seed = models.IntegerField(null=True, blank=True)
    use_custom_api_key = models.BooleanField(default=False)
    extra_config = models.JSONField(default=dict, blank=True)


class ChatSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.OneToOneField(AgentConfig, related_name='chat_settings', on_delete=models.CASCADE)
    history_policy = models.CharField(max_length=20, null=True, blank=True)
    history_length = models.IntegerField(null=True, blank=True)


class InitialMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat_settings = models.ForeignKey(ChatSettings, related_name='initial_messages', on_delete=models.CASCADE)
    message = models.TextField()


class ChatPrompt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat_settings = models.ForeignKey(ChatSettings, related_name='chat_prompts', on_delete=models.CASCADE)
    prompt = models.TextField()
