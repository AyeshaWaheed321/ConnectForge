from django.urls import  path
from .views import AgentConfigViewSet, ExtendMCPServersView, SampleAgentConfigView, chat, chat_history
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'agents', AgentConfigViewSet, basename='agent-config')

urlpatterns = [
    path('sample-config/', SampleAgentConfigView.as_view(), name='sample-agent-config'),
    path("chat/", chat, name="chat"),
    path("chat/history/", chat_history, name="chat-history"),
    path('agents/<uuid:id>/extend/', ExtendMCPServersView.as_view(), name='extend-mcp-servers'),
]

urlpatterns += router.urls
