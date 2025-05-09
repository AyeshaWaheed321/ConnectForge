import os
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AgentConfigSerializer
import json

class AgentRegisterView(APIView):
    
    @swagger_auto_schema(request_body=AgentConfigSerializer)
    def post(self, request):
        try:
            config_data = json.loads(request.body)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON format.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AgentConfigSerializer(data=config_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
