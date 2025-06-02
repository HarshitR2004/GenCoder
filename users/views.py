from .serializers import UserSerializer 
from rest_framework.views import APIView
from django.http import JsonResponse
from users.models import User 

class UserAPIView(APIView):
    """
    Handle all user-related operations in a single class.
    """
    
    def get(self, request, user_id=None):
        """
        Retrieve a user by ID or return error if not found.
        """
        if user_id:
            user = UserSerializer.get_user_by_id(user_id)
            if user:
                return UserSerializer.serialize(user)
            else:
                return JsonResponse({'error': 'User not found'}, status=404)
        else:
            return JsonResponse({'error': 'User ID required'}, status=400)
    
    def post(self, request, user_id=None):
        """
        Create a new user.
        """
        data = request.data
        
        # Add input validation
        if not data.get('username') or not data.get('password'):
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        try:
            user = UserSerializer.create_user(data)
            return UserSerializer.serialize(user, status=201)
        except Exception as e:
            return JsonResponse({'error': f'Failed to create user: {str(e)}'}, status=400)
    
    def put(self, request, user_id=None):
        """
        Update an existing user.
        """
        if not user_id:
            return JsonResponse({'error': 'User ID required'}, status=400)
            
        data = request.data
        user = UserSerializer.update_user(user_id, data)
        if user:
            return UserSerializer.serialize(user)
        else:
            return JsonResponse({"error": "User Not Found"}, status=404)
    
    def delete(self, request, user_id=None):
        """
        Delete a user by ID.
        """
        if not user_id:
            return JsonResponse({'error': 'User ID required'}, status=400)
            
        success = UserSerializer.delete(user_id)
        if success:
            return JsonResponse({"message": f"User {user_id} deleted successfully"}, status=204)
        else:
            return JsonResponse({"error": "User Not Found"}, status=404)

class LoginAPIView(APIView):
    """
    Handle user authentication.
    """
    
    def post(self, request):
        """
        Handle user login.
        """
        user_name = request.data.get('username')
        password = request.data.get('password')
        
        # Add input validation
        if not user_name or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        user = UserSerializer.authenticate(user_name, password)
        if user:
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user_id': user.id,
                    'username': user.username,
                    'user_type': user.user_type,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=200)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid username or password'
            }, status=401)

class UserListAPIView(APIView):
    """
    Handle listing all users (for admin purposes).
    """
    
    def get(self, request):
        """
        Retrieve all users.
        """
        try:
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)
            return JsonResponse({
                'success': True,
                'data': serializer.data
            }, status=200)
        except Exception as e:
            return JsonResponse({'error': f'Failed to retrieve users: {str(e)}'}, status=500)
