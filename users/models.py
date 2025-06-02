from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 
    
    def is_admin_user(self):
        return self.user_type == 'admin'
    
    def is_normal_user(self):
        return self.user_type == 'user'
    
    def __str__(self):
        return f"{self.id}"
    
    def create_user(self, username, password, user_type='user'):
        """
        Create a new user with the given username, password, and user type.
        """
        user = User(username=username, user_type=user_type)
        user.set_password(password)
        user.save()
        return user
    

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    problems_solved = models.PositiveIntegerField(default=0)
    total_submissions = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}"
