from django.urls import  path
from .views import AgentConfigViewSet, ExtendMCPServersView, SampleAgentConfigView, SetLLMApiKeyView, chat
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'agents', AgentConfigViewSet, basename='agent-config')

urlpatterns = [
    path('sample-config/', SampleAgentConfigView.as_view(), name='sample-agent-config'),
    path("chat/", chat, name="chat"),
    path('agents/<uuid:id>/extend-mcp/', ExtendMCPServersView.as_view(), name='extend-mcp-servers'),
    path("llm-provider/set-api-key/", SetLLMApiKeyView.as_view(), name="set-llm-api-key"),
]

urlpatterns += router.urls
