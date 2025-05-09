from django.urls import path
from .views import AgentRegisterView, SampleAgentConfigView


urlpatterns = [
    path('register/', AgentRegisterView.as_view(), name='agent-register'),
    path('sample-config/', SampleAgentConfigView.as_view(), name='sample-agent-config'),
]
