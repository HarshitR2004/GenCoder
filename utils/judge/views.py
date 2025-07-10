import os
import django


if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gencoder.settings')
    django.setup()


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .Judge import Judge
from utils.storage.s3_service import S3Service
from testcase.models import TestCase


s3service = S3Service()

class ExecuteCodeAPIView(APIView):
    """
    API endpoint for executing user code using the judge service.
    """
    
    def post(self, request):
        """
        Execute user code with the judge service.
        """
        try:
            submission_results = {"correct": [], "incorrect": []}
            
            # Extract data from request
            queston_id = request.data.get('question_id')
            user_code = request.data.get('user_code')
            language = request.data.get('language')
            problem_type = request.data.get('problem_type')
            
            # Initialize judge and execute code
            judge = Judge()
            
            input_output_pairs = self._get_testcases(queston_id)
            
            inputs = input_output_pairs['input']
            outputs = input_output_pairs['output']
            
            for i in range(len(inputs)):
                result = judge.execute_code(
                        user_code=user_code,
                        language=language,
                        problem_type=problem_type,
                        args=inputs[i],
                )
                
                actual_output = result['run']['output'].strip()
                expected_output = outputs[i]
                
                if actual_output == expected_output:
                    submission_results['correct'].append({
                        'test_case_id': i + 1,
                        'output': result['run']['output'],
                        'status': 'correct'
                })
                    
                else:
                    submission_results['incorrect'].append({
                        'test_case_id': i + 1,
                        'output': result['run']['output'],
                        'expected_output': outputs[i],
                        'status': 'incorrect'
                    })
            
            return Response({
                'success': True,
                'submission_results': submission_results
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': f'Validation error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Execution error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_testcases(self, question_id):
        """
        Helper method to retrieve test cases for a given question ID.
        """
        test_cases = TestCase.objects.filter(question_id=question_id)
        input_output_pairs = {"input": [], "output": []}
        for id in range(len(test_cases)):
            response = s3service.get_input_and_output(question_id = question_id, case_id = id + 1)
            input_output_pairs["input"].append(response['input'].split('\n'))
            input_output_pairs["output"].append(response['output'])
            
        return input_output_pairs

