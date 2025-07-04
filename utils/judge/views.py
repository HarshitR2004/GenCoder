from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .Judge import Judge


class ExecuteCodeAPIView(APIView):
    """
    API endpoint for executing user code using the judge service.
    """
    
    def post(self, request):
        """
        Execute user code with the judge service.
        
        Expected payload:
        {
            "user_code": "def add(a, b):\n    return a + b",
            "language": "python",
            "problem_type": "function_only_int", 
            "function_name": "add",
            "args": ["3", "5"]
        }
        """
        try:
            # Extract data from request
            user_code = request.data.get('user_code')
            language = request.data.get('language')
            problem_type = request.data.get('problem_type')
            function_name = request.data.get('function_name')
            args = request.data.get('args', [])
            
            # Validate required fields
            if not all([user_code, language, problem_type, function_name]):
                return Response({
                    'success': False,
                    'error': 'Missing required fields: user_code, language, problem_type, function_name'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize judge and execute code
            judge = Judge()
            result = judge.execute_code(
                user_code=user_code,
                language=language,
                problem_type=problem_type,
                function_name=function_name,
                args=args
            )
            
            return Response({
                'success': True,
                'result': result
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
