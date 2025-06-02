from rest_framework import serializers
from .models import TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input', 'output', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    
        
            
        
    
     