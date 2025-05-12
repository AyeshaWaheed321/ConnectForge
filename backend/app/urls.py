from django.urls import  path
from .views import AgentConfigViewSet, AgentMetricsView, ExtendMCPServersView, RecentActivityLogsView, SampleAgentConfigView, chat, chat_history, delete_chat_history
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'agents', AgentConfigViewSet, basename='agent-config')

urlpatterns = [
    path('sample-config/', SampleAgentConfigView.as_view(), name='sample-agent-config'),
    path("chat/", chat, name="chat"),
    path("chat/history/", chat_history, name="chat-history"),
    path("chat/delete/", delete_chat_history, name="chat-delete"),
    path('agents/<uuid:id>/extend/', ExtendMCPServersView.as_view(), name='extend-mcp-servers'),
    path('dashboard/analytics/', AgentMetricsView.as_view(), name='dashboard-analytics'),
    path('dashboard/logs/', RecentActivityLogsView.as_view(), name='dashboard-logs'),
]

urlpatterns += router.urls
