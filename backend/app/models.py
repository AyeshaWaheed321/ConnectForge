import uuid
from django.db import models

class LLMProvider(models.TextChoices):
    GROQ = "groq", "Groq"
    OPENAI = "openai", "OpenAI"

class LLMConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=50, choices=LLMProvider.choices, default=LLMProvider.GROQ)
    model = models.CharField(max_length=100)
    max_tokens = models.PositiveIntegerField(default=1000)
    temperature = models.FloatField(default=0)
    timeout = models.PositiveIntegerField(default=10)
    max_retries = models.PositiveIntegerField(default=2)
    n_history_messages = models.PositiveIntegerField(default=4)
    api_key = models.CharField(max_length=512, null=True, blank=True)  # stored but excluded from serializer


class AgentConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_name = models.CharField(max_length=255, unique=True, default="")
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    llm = models.OneToOneField(LLMConfig, on_delete=models.CASCADE, default=None)
    system_message = models.TextField(null=True, blank=True, default="You are a helpful AI assistant with access to tools.")
    mcp_server = models.JSONField(default=dict)


class Tool(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, related_name='tools', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    
class ChatHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AgentConfig, on_delete=models.CASCADE)
    message = models.TextField()
    role = models.CharField(max_length=10, choices=[('human', 'Human'), ('ai', 'AI')])
    timestamp = models.DateTimeField(auto_now_add=True)
    role_order = models.IntegerField(choices=[(0, 'Human'), (1, 'AI')], default=0)

    def __str__(self):
        return f"Message from {self.role.capitalize()} at {self.timestamp}"

class ActivityEvents(models.TextChoices):
    AGENT_CREATED = "agent_created", "Agent Created"
    AGENT_DELETED = "agent_deleted", "Agent Deleted"
    AGENT_MODIFIED = "agent_modified", "Agent Modified"
    CHAT_STARTED = "chat_started", "Chat Started"
    CHAT_ENDED = "chat_ended", "Chat Ended"
    CHAT_DELETED = "chat_deleted", "Chat Deleted"
    ERROR_OCCURRED = "error_occurred", "Error Occurred"

class AgentActivityLog(models.Model):
    agent = models.ForeignKey(AgentConfig, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ActivityEvents.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.action} @ {self.timestamp}"

class AgentMetric(models.Model):
    agent = models.ForeignKey(AgentConfig, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    
    total_requests = models.PositiveIntegerField(default=0)
    total_success = models.PositiveIntegerField(default=0)
    total_failures = models.PositiveIntegerField(default=0)
    total_response_time_ms = models.BigIntegerField(default=0)

    def average_response_time(self):
        if self.total_requests == 0:
            return 0
        return self.total_response_time_ms / self.total_requests
