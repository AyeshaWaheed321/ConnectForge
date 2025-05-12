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
    api_key = models.CharField(max_length=512, null=True, blank=True)  # stored but excluded from serializer


class AgentConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_name = models.CharField(max_length=255, unique=True, default="")
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    llm = models.OneToOneField(LLMConfig, on_delete=models.CASCADE, default=None)
    system_message = models.TextField(null=True, blank=True, default="You are a helpful AI assistant with access to tools.")
    n_history_messages = models.PositiveIntegerField(default=4)
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

    def __str__(self):
        return f"Message from {self.role.capitalize()} at {self.timestamp}"
