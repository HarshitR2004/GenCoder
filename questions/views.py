# questions/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Language, Topic
from testcase.models import TestCase
from .serializers import QuestionCreateSerializer, QuestionDetailSerializer
import logging

logger = logging.getLogger(__name__)

class QuestionCreateView(APIView):
    def post(self, request):
        """Create question with multiple test cases - supports both file and content upload"""
        try:
            # Use serializer for validation
            serializer = QuestionCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            
            # Step 1: Create Question
            question = Question(
                title=data.get('title'),
                difficulty=data.get('difficulty', 'easy')
            )
            
            # Create question in S3 - support both methods
            if 'markdown_content' in data:
                success = question.create_question_from_content(data['markdown_content'])
            elif 'markdown_file_path' in data:
                success = question.create_question_from_file(data['markdown_file_path'])
            else:
                return Response({
                    'success': False,
                    'error': 'Either markdown_content or markdown_file_path is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not success:
                return Response({
                    'success': False,
                    'error': 'Failed to create question in S3'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Step 2: Handle test cases - both single and multiple
            created_test_cases = []
            
            # Method 1: Single test case (backward compatibility)
            if 'input_content' in data and 'output_content' in data:
                test_case = question.add_test_case_from_content(
                    data['input_content'],
                    data['output_content'],
                    is_example=True
                )
                created_test_cases.append(test_case)
            elif 'input_file_path' in data and 'output_file_path' in data:
                test_case = question.add_test_case_from_files(
                    data['input_file_path'],
                    data['output_file_path'],
                    is_example=True
                )
                created_test_cases.append(test_case)
            
            # Method 2: Multiple test cases
            test_cases_data = data.get('test_cases', [])
            for i, test_case_data in enumerate(test_cases_data):
                if 'input_content' in test_case_data and 'output_content' in test_case_data:
                    test_case = question.add_test_case_from_content(
                        test_case_data['input_content'],
                        test_case_data['output_content'],
                        is_example=test_case_data.get('is_example', i == 0),
                        is_hidden=test_case_data.get('is_hidden', False)
                    )
                    created_test_cases.append(test_case)
                elif 'input_file_path' in test_case_data and 'output_file_path' in test_case_data:
                    test_case = question.add_test_case_from_files(
                        test_case_data['input_file_path'],
                        test_case_data['output_file_path'],
                        is_example=test_case_data.get('is_example', i == 0),
                        is_hidden=test_case_data.get('is_hidden', False)
                    )
                    created_test_cases.append(test_case)
                else:
                    return Response({
                        'success': False,
                        'error': f'Test case {i + 1} must have either content or file paths'
                    }, status=status.HTTP_400_BAD_REQUEST)

            if not created_test_cases:
                return Response({
                    'success': False,
                    'error': 'At least one test case is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Step 3: Add relationships
            if 'language_ids' in data:
                languages = Language.objects.filter(id__in=data['language_ids'])
                question.languages.set(languages)

            if 'topic_ids' in data:
                topics = Topic.objects.filter(id__in=data['topic_ids'])
                question.topics.set(topics)

            return Response({
                'success': True,
                'message': f'Question created successfully with {len(created_test_cases)} test cases',
                'data': question.get_complete_question_data()
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating question: {e}")
            return Response({
                'success': False,
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TestCaseCreateView(APIView):
    def post(self, request):
        """Add a new test case to an existing question - supports both file and content upload"""
        try:
            data = request.data
            question_id = data.get('question_id')
            
            if not question_id:
                return Response({
                    'success': False,
                    'error': 'question_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                question = Question.objects.get(id=question_id)
            except Question.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Question not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Support both content and file upload methods
            test_case = None
            if 'input_content' in data and 'output_content' in data:
                test_case = question.add_test_case_from_content(
                    data['input_content'],
                    data['output_content'],
                    is_example=data.get('is_example', False),
                    is_hidden=data.get('is_hidden', False)
                )
            elif 'input_file_path' in data and 'output_file_path' in data:
                test_case = question.add_test_case_from_files(
                    data['input_file_path'],
                    data['output_file_path'],
                    is_example=data.get('is_example', False),
                    is_hidden=data.get('is_hidden', False)
                )
            else:
                return Response({
                    'success': False,
                    'error': 'Either content (input_content, output_content) or file paths (input_file_path, output_file_path) must be provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if test_case:
                return Response({
                    'success': True,
                    'message': 'Test case added successfully',
                    'data': {
                        'test_case_id': test_case.id,
                        'question_id': question.id,
                        'input_url': test_case.get_input_url(),
                        'output_url': test_case.get_output_url(),
                        'is_example': test_case.is_example,
                        'is_hidden': test_case.is_hidden,
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'error': 'Failed to create test case'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error creating test case: {e}")
            return Response({
                'success': False,
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Keep other views unchanged...


