from .models import TestCase
from django.http import JsonResponse
import os
import json
from django.views.decorators.csrf import csrf_exempt

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

