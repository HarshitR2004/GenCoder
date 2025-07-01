from rest_framework.views import APIView
from utils.storage.s3_service import S3Service
from .serializers import QuestionSerializer, LanguageSerializer, TopicSerializer
from rest_framework.response import Response
from django.core.files.uploadedfile import UploadedFile
from .models import Question, Language, Topic
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from testcase.models import TestCase
import logging
import json

s3 = S3Service()
logger = logging.getLogger(__name__)

class QuestionAPIView(APIView):
    """
    Base API view for questions.
    This can be extended for specific question-related endpoints.
    """
    
    def get(self, request):
        """
        Handle GET requests to retrieve questions.
        """
        question_id = request.query_params.get('id')
        
        if question_id and not question_id.isdigit():
            return Response({"error": "Invalid question_id format"}, status=400)
        
        result = s3.get_question(question_id)
        if isinstance(result, dict) and 'error' in result:
            return Response(result, status=result.get('status', 500)) 
        
        return result
    
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

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000 
    
class QuestionListAPIView(APIView):
    """
    API view to list all questions with pagination.
    """
    
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        """
        Handle GET requests to list questions.
        """
        questions = Question.objects.all().order_by('-created_at')
        paginator = self.pagination_class()
        paginated_questions = paginator.paginate_queryset(questions, request)
        
        serializer = QuestionSerializer(paginated_questions, many=True)
        return paginator.get_paginated_response(serializer.data)

class QuestionDetailView(APIView):
    """
    API view to get, update, or delete a specific question.
    """
    
    def get(self, request, question_id):
        """Get a specific question with test cases"""
        try:
            question = Question.objects.get(id=question_id)
            
            # Get test cases
            test_cases = TestCase.objects.filter(question=question)
            
            # Prepare response data
            question_data = QuestionSerializer(question).data
            
            # Add test cases data
            question_data['test_cases'] = []
            for test_case in test_cases:
                question_data['test_cases'].append({
                    'id': test_case.id,
                    'input_content': test_case.input_content if hasattr(test_case, 'input_content') else '',
                    'output_content': test_case.output_content if hasattr(test_case, 'output_content') else '',
                    'is_example': test_case.is_example,
                    'is_hidden': test_case.is_hidden
                })
            
            # Add languages and topics
            question_data['languages'] = LanguageSerializer(question.languages.all(), many=True).data
            question_data['topics'] = TopicSerializer(question.topics.all(), many=True).data
            
            return Response(question_data, status=status.HTTP_200_OK)
            
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching question {question_id}: {e}")
            return Response({
                'error': 'An error occurred while fetching the question'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, question_id):
        """Update a specific question"""
        try:
            question = Question.objects.get(id=question_id)
            data = request.data
            
            # Update basic fields
            question.title = data.get('title', question.title)
            question.difficulty = data.get('difficulty', question.difficulty)
            
            # Store markdown content in S3 or database
            if data.get('markdown_content'):
                # You can implement S3 storage here or store in database
                question.question_s3_key = f"questions/question_{question.id}/question.md"
                # For now, we'll assume you have a field to store markdown content
                if hasattr(question, 'markdown_content'):
                    question.markdown_content = data.get('markdown_content')
            
            question.save()
            
            # Update test cases
            if 'test_cases' in data:
                # Delete existing test cases
                TestCase.objects.filter(question=question).delete()
                
                # Create new test cases
                for test_case_data in data['test_cases']:
                    TestCase.objects.create(
                        question=question,
                        input_content=test_case_data.get('input_content', ''),
                        output_content=test_case_data.get('output_content', ''),
                        is_example=test_case_data.get('is_example', False),
                        is_hidden=test_case_data.get('is_hidden', False)
                    )
            
            # Update relationships
            if 'language_ids' in data:
                languages = Language.objects.filter(id__in=data['language_ids'])
                question.languages.set(languages)

            if 'topic_ids' in data:
                topics = Topic.objects.filter(id__in=data['topic_ids'])
                question.topics.set(topics)
            
            return Response({
                'success': True,
                'message': 'Question updated successfully',
                'data': QuestionSerializer(question).data
            }, status=status.HTTP_200_OK)
            
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating question {question_id}: {e}")
            return Response({
                'error': f'An error occurred while updating the question: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QuestionCreateView(APIView):
    """
    API view to create new questions.
    """
    
    def post(self, request):
        """Create question with test cases and markdown content"""
        try:
            data = request.data
            
            # Validate required fields
            if not data.get('title'):
                return Response({
                    'success': False,
                    'error': 'Title is required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if not data.get('markdown_content'):
                return Response({
                    'success': False,
                    'error': 'Markdown content is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create question
            question = Question.objects.create(
                title=data.get('title'),
                difficulty=data.get('difficulty', 'easy')
            )
            
            # Store markdown content (implement S3 storage or database storage)
            question.question_s3_key = f"questions/question_{question.id}/question.md"
            
            # If you have a markdown_content field in your model, store it
            if hasattr(question, 'markdown_content'):
                question.markdown_content = data.get('markdown_content')
            
            question.save()

            # Create test cases
            test_cases_data = data.get('test_cases', [])
            if test_cases_data:
                for test_case_data in test_cases_data:
                    if test_case_data.get('input_content') and test_case_data.get('output_content'):
                        TestCase.objects.create(
                            question=question,
                            input_content=test_case_data.get('input_content', ''),
                            output_content=test_case_data.get('output_content', ''),
                            is_example=test_case_data.get('is_example', False),
                            is_hidden=test_case_data.get('is_hidden', False)
                        )

            # Add language relationships
            if 'language_ids' in data and data['language_ids']:
                languages = Language.objects.filter(id__in=data['language_ids'])
                question.languages.set(languages)

            # Add topic relationships
            if 'topic_ids' in data and data['topic_ids']:
                topics = Topic.objects.filter(id__in=data['topic_ids'])
                question.topics.set(topics)

            return Response({
                'success': True,
                'message': 'Question created successfully',
                'data': {
                    'id': question.id,
                    'title': question.title,
                    'difficulty': question.difficulty
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating question: {e}")
            return Response({
                'success': False,
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LanguageListAPIView(APIView):
    """
    API view to list all programming languages.
    """
    
    def get(self, request):
        """Get all available programming languages"""
        try:
            languages = Language.objects.all().order_by('name')
            serializer = LanguageSerializer(languages, many=True)
            return Response({
                'success': True,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching languages: {e}")
            return Response({
                'success': False,
                'error': 'Failed to fetch languages'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
class TopicListAPIView(APIView):
    """
    API view to list all topics.
    """
    
    def get(self, request):
        """Get all available topics"""
        try:
            topics = Topic.objects.all()
            serializer = TopicSerializer(topics, many=True)
            return Response({
                'success': True,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching topics: {e}")
            return Response({
                'success': False,
                'error': 'Failed to fetch topics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    