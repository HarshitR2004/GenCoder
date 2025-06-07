# questions/views.py
from rest_framework.views import APIView
from utils.storage.s3_service import S3Service
from .serializers import QuestionSerializer
from rest_framework.response import Response
from django.core.files.uploadedfile import UploadedFile
from .models import Question

s3 = S3Service()

class QuestionAPIView(APIView):
    """
    Base API view for questions.
    This can be extended for specific question-related endpoints.
    """
    
    def post(self, request, *args, **kwargs):
        """
        Handle POST requests to create a new question.
        """
        serializer = QuestionSerializer(data=request.data)
        if not serializer.is_valid():
          return Response(serializer.errors, status=400)
        question = serializer.save()
        markdown_file = request.FILES.get('markdown_file')
        upload_result = s3.upload_question_file(markdown_file, question.id) if isinstance(markdown_file, UploadedFile) else None
        return upload_result
        
    
    
        