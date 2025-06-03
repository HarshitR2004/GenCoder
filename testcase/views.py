from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import TestCase
import json
import os
import logging

logger = logging.getLogger(__name__)

class TestCaseCreateView(APIView):
    def post(self, request):
        """Create test case with S3 storage"""
        try:
            data = request.data
            
            # Validate required fields
            if not (data.get('input_file_path') and data.get('output_file_path')) and \
               not (data.get('input_content') and data.get('output_content')):
                return Response({
                    'success': False,
                    'error': 'Either file paths or content must be provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create testcase
            testcase = TestCase()
            
            # Create from files or content
            if data.get('input_file_path') and data.get('output_file_path'):
                success = testcase.create_testcase_from_files(
                    data['input_file_path'],
                    data['output_file_path']
                )
            else:
                success = testcase.create_testcase_from_content(
                    data['input_content'],
                    data['output_content']
                )
            
            if success:
                return Response({
                    'success': True,
                    'message': 'Test case created successfully in S3',
                    'data': {
                        'testcase_id': testcase.id,
                        'input_s3_key': testcase.input_s3_key,
                        'output_s3_key': testcase.output_s3_key,
                        'input_url': testcase.get_input_url(),
                        'output_url': testcase.get_output_url(),
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'error': 'Failed to create test case in S3'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error creating testcase: {e}")
            return Response({
                'success': False,
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TestCaseDetailView(APIView):
    def get(self, request, testcase_id):
        """Get test case with content and URLs"""
        try:
            testcase = TestCase.objects.get(id=testcase_id)
            return Response({
                'success': True,
                'data': {
                    'id': testcase.id,
                    'input_content': testcase.get_input_content(),
                    'output_content': testcase.get_output_content(),
                    'input_url': testcase.get_input_url(),
                    'output_url': testcase.get_output_url(),
                    'created_at': testcase.created_at,
                    'updated_at': testcase.updated_at,
                }
            })
        except TestCase.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Test case not found'
            }, status=status.HTTP_404_NOT_FOUND)

# Keep the old function-based view for backward compatibility if needed
# but remove the local file creation logic
@csrf_exempt
def generate_testcase(request):  
    
    if request.method == 'POST':
        try:
            # Get input data from request
            data = json.loads(request.body)
            input_data_path = data.get('input_data_path')
            output_data_path = data.get('output_data_path')
            
            
            # Validate required fields
            if not input_data_path or not output_data_path:
                return JsonResponse({
                    'error': 'Both input_data_path and output_data_path are required',
                    'status': 400
                }, status=400)
            
            # Check if files exist
            if not os.path.exists(input_data_path):
                return JsonResponse({
                    'error': f'Input file not found: {input_data_path}',
                    'status': 404
                }, status=404)
                
            if not os.path.exists(output_data_path):
                return JsonResponse({
                    'error': f'Output file not found: {output_data_path}',
                    'status': 404
                }, status=404)
            
            # Create and process testcase
            testcase = TestCase()
            testcase.genrate_input_output(input_data_path, output_data_path)
            
            return JsonResponse({
                'success': True,
                'message': 'Test case generated successfully',
                'data': {
                    'testcase_id': testcase.id,
                    'input_path': testcase.input_path,
                    'output_path': testcase.output_path
                },
                'status': 200
            }, status=200)
            
        except FileNotFoundError as e:
            return JsonResponse({
                'error': f'File not found: {str(e)}',
                'status': 404
            }, status=404)
            
        except PermissionError as e:
            return JsonResponse({
                'error': f'Permission denied: {str(e)}',
                'status': 403
            }, status=403)
            
        except Exception as e:
            return JsonResponse({
                'error': f'An unexpected error occurred: {str(e)}',
                'status': 500
            }, status=500)
    
    else:
        return JsonResponse({
            'error': 'Only POST method is allowed',
            'status': 405
        }, status=405)

