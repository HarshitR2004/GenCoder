from rest_framework import serializers
from django.http import JsonResponse
from .models import User
  
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'first_name', 'last_name', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}

    @staticmethod
    def get_user_by_id(user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def create_user(data):
        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            user_type=data.get('user_type', 'user')
        )
        return user
    
    @staticmethod
    def update_user(user_id, data):
        try:
            user = User.objects.get(id=user_id)
            for key, value in data.items():
                if key != 'password':
                    setattr(user, key, value)
                else:
                    user.set_password(value)
            user.save()
            return user
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def delete(user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False
    
    @staticmethod
    def authenticate(username, password):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                return user
            return None
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def serialize(user, status=200):
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data, status=status)



