from rest_framework.views import APIView
from utils.storage.s3_service import S3Service
from .serializers import QuestionSerializer, LanguageSerializer, TopicSerializer
from rest_framework.response import Response
from .models import Question, Language, Topic, Code
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from testcase.models import TestCase

s3 = S3Service()

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000 

class QuestionAPIView(APIView):
    """
    Consolidated API view for question-related operations.
    Handles listing, creating, retrieving, and deleting questions.
    """
    
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, question_id=None):
        """
        Handle GET requests to retrieve questions.
        - If question_id is provided: return specific question with details
        - If no question_id: return paginated list of all questions
        """
        if question_id:
            # Get specific question with test cases
            try:
                question = Question.objects.get(id=question_id)
                
                test_cases = TestCase.objects.filter(question=question)
                
                question_data = QuestionSerializer(question).data
                
                question_data['test_cases'] = []
                for test_case in test_cases:
                    # Get input/output content from S3
                    s3_content = s3.get_input_and_output(question.id, test_case.id)
                    print(s3_content)
                    
                    test_case_data = {
                        'id': test_case.id,
                        'input_content': s3_content.get('input', ''),
                        'output_content': s3_content.get('output', ''),
                        'is_example': test_case.is_example,
                        'is_hidden': test_case.is_hidden
                    }
                    
                    question_data['test_cases'].append(test_case_data)
                
                
                question_data['starter_code'] = self._get_starter_code(question.id)
                question_data['description'] = self._get_description(question.id)
                
                # Add languages and topics
                question_data['languages'] = LanguageSerializer(question.languages.all(), many=True).data
                question_data['topics'] = TopicSerializer(question.topics.all(), many=True).data
                
                return Response(question_data, status=status.HTTP_200_OK)
                
            except Question.DoesNotExist:
                return Response({
                    'error': 'Question not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
            except Exception as e:
                return Response({
                    'error': 'An error occurred while fetching the question'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # List all questions with pagination
            try:
                questions = Question.objects.all().order_by('-created_at')
                paginator = self.pagination_class()
                paginated_questions = paginator.paginate_queryset(questions, request)
                
                serializer = QuestionSerializer(paginated_questions, many=True)
                return paginator.get_paginated_response(serializer.data)
            except Exception:
                return Response({
                    'success': False,
                    'error': 'Failed to fetch questions'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, *args, **kwargs):
        """
        Handle POST requests to create a new question.
        """
        try:
            # Validate and create question
            question_serializer = QuestionSerializer(data=request.data)
            if not question_serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid question data',
                    'details': question_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            question = question_serializer.save()
            
            # Handle markdown content
            markdown_content = request.data.get('markdown_content', '')
            if not markdown_content:
                question.delete()  # Cleanup
                return Response({
                    'success': False,
                    'error': 'Markdown content is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Upload to S3
            try:
                s3.upload_question(question.id, markdown_content)
            except Exception as e:
                question.delete()  # Cleanup
                return Response({
                    'success': False,
                    'error': f'Failed to upload question content: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Handle test cases
            self._create_test_cases(question, request.data.get('test_cases', []))
            
            # Handle starter code
            self._create_starter_code(question, request.data.get('starter_code', {}))
            
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
            return Response({
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _create_test_cases(self, question, test_cases_data):
        for index, test_case_data in enumerate(test_cases_data):
            case_id = f"case_{index + 1}"
            
            input_content = test_case_data.get('input_content', '')
            output_content = test_case_data.get('output_content', '')
            
            if not input_content or not output_content:
                continue  # Skip empty test case
            
            try:
                input_key = s3.upload_input(question.id, case_id, input_content)
                output_key = s3.upload_output(question.id, case_id, output_content)
                
                TestCase.objects.create(
                    question=question,
                    input_s3_key=input_key,
                    output_s3_key=output_key,
                    is_example=test_case_data.get('is_example', False),
                    is_hidden=test_case_data.get('is_hidden', True)
                )
            except Exception:
                
                continue
    def _get_description(self, question_id):
        """
        Retrieve the markdown description for a specific question.
        """
        try:
            return s3.get_question(question_id)
        except Exception as e:
            raise Exception(f"Failed to retrieve question content: {str(e)}")
    
    def _create_starter_code(self, question, starter_code_data):
        
        languages = Language.objects.all()
        
        for language in languages:
            if language.name in starter_code_data:
                code_content = starter_code_data[language.name]
                
                try:
                    key = s3.upload_starter_code(question.id, language.name, code_content)
                    Code.objects.create(
                        question=question,
                        language=language,
                        code_s3_key=key
                    )
                except Exception as e:
                    raise Exception(f"Failed to upload starter code for {language.name}: {str(e)}")
                
    def _get_starter_code(self, question_id):
        """
        Retrieve the starter code for a specific question and language.
        """
        languages = Language.objects.all()
        starter_code = {}
        try:
            for language in languages:
                starter_code[language.name] = s3.get_starter_code(question_id, language.name)
            return starter_code
        except Exception as e:
            raise Exception(f"Failed to retrieve starter code: {str(e)}")
        

    def delete(self, request, question_id):
        """
        Handle DELETE requests to delete a specific question.
        """
        try:
            question = Question.objects.get(id=question_id)
            
            # Delete associated test cases 
            TestCase.objects.filter(question=question).delete()
            
            # Delete associated starter code records
            Code.objects.filter(question=question).delete()
            
            # Delete the question itself
            question.delete()
            
            return Response({
                'success': True,
                'message': 'Question deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'An error occurred while deleting the question: {str(e)}'
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
        except Exception:
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
            return Response({
                'success': False,
                'error': 'Failed to fetch topics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


