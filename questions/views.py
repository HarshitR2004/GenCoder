# questions/views.py
from rest_framework.views import APIView
from utils.storage.s3_service import S3Service
from .serializers import QuestionSerializer
from rest_framework.response import Response

s3 = S3Service()

class QuestionAPIView(APIView):
    """
    Base API view for questions.
    This can be extended for specific question-related endpoints.
    """
    
    def get(self, request, *args, **kwargs):
        """
        This gets the question content from S3 based on the provided question ID.
        """
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            question_id = serializer.validated_data.get('id')
            question_content = s3.get_question(question_id)
            
            return Response({
                'question_id': question_id,
                'content': question_content
            }, status=200) 
        else:
            return Response(serializer.errors, status=400) 
        