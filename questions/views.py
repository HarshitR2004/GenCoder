from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Question, Language
from testcase.models import TestCase
import json
import os


# Create your views here.
@csrf_exempt
def create_question(request):
    """
    View to handle question creation and automatic test case creation.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Extract data
            title = data.get('title', 'Untitled Question')
            markdown_file_path = data.get('markdown_file_path')
            input_data_path = data.get('input_data_path')
            output_data_path = data.get('output_data_path')
            difficulty = data.get('difficulty', 'easy')
            language_id = data.get('language_id', 1)
            
            # Validate required fields
            if not all([markdown_file_path, input_data_path, output_data_path]):
                return JsonResponse({
                    'error': 'Missing required fields: markdown_file_path, input_data_path, output_data_path'
                }, status=400)
            
            # Validate files exist
            if not os.path.exists(markdown_file_path):
                return JsonResponse({
                    'error': f'Markdown file not found: {markdown_file_path}'
                }, status=404)
                
            if not os.path.exists(input_data_path):
                return JsonResponse({
                    'error': f'Input file not found: {input_data_path}'
                }, status=404)
                
            if not os.path.exists(output_data_path):
                return JsonResponse({
                    'error': f'Output file not found: {output_data_path}'
                }, status=404)
            
            # Step 1: Create TestCase first
            testcase = TestCase()
            testcase.genrate_input_output(input_data_path, output_data_path)
            
            # Step 2: Get language
            try:
                language = Language.objects.get(id=language_id)
            except Language.DoesNotExist:
                return JsonResponse({
                    'error': f'Language with id {language_id} not found'
                }, status=404)
            
            # Step 3: Create Question instance
            question = Question(
                title=title,
                difficulty=difficulty,
                test_cases=testcase,  # Link to the created test case
                languages=language
            )
            
            # Step 4: Process question files and create actual files
            question_file_path, input_path, output_path = question.add_files_from_markdown(
                markdown_file_path, input_data_path, output_data_path
            )
            
            # Verify all files were created
            verification = {
                'question_file_exists': os.path.exists(question_file_path),
                'question_input_exists': os.path.exists(input_path),
                'question_output_exists': os.path.exists(output_path),
                'testcase_input_exists': os.path.exists(testcase.input_path),
                'testcase_output_exists': os.path.exists(testcase.output_path),
                'database_folder_exists': os.path.exists(f"database/question{question.id}")
            }
            
            return JsonResponse({
                'success': True,
                'message': 'Question and test case created successfully with actual files',
                'verification': verification,
                'data': {
                    'question_id': question.id,
                    'question_title': question.title,
                    'question_file_path': question_file_path,
                    'input_file_path': input_path,
                    'output_file_path': output_path,
                    'testcase_id': testcase.id,
                    'testcase_input_path': testcase.input_path,
                    'testcase_output_path': testcase.output_path,
                    'difficulty': question.difficulty,
                    'language': language.name
                }
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

