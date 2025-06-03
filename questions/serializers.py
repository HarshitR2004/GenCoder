from rest_framework import serializers
from .models import Question, Language, Topic
import os

class QuestionCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    difficulty = serializers.ChoiceField(choices=['easy', 'medium', 'hard'], default='easy')
    
    # Question content options (either file path or direct content)
    markdown_file_path = serializers.CharField(required=False)
    markdown_content = serializers.CharField(required=False)
    
    # Single test case options (backward compatibility)
    input_file_path = serializers.CharField(required=False)
    output_file_path = serializers.CharField(required=False)
    input_content = serializers.CharField(required=False)
    output_content = serializers.CharField(required=False)
    
    # Multiple test cases
    test_cases = serializers.ListField(
        child=serializers.DictField(), 
        required=False,
        allow_empty=True
    )
    
    # Relationships
    language_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    topic_ids = serializers.ListField(child=serializers.IntegerField(), required=False)

    def validate(self, data):
        # Ensure either file paths or content is provided for question
        if not (data.get('markdown_file_path') or data.get('markdown_content')):
            raise serializers.ValidationError(
                "Either 'markdown_file_path' or 'markdown_content' must be provided"
            )
        
        # Validate file existence if paths are provided
        if data.get('markdown_file_path') and not os.path.exists(data['markdown_file_path']):
            raise serializers.ValidationError(
                f"Markdown file not found: {data['markdown_file_path']}"
            )
        
        # Validate single test case (backward compatibility)
        single_test_case = False
        if data.get('input_file_path') or data.get('output_file_path') or data.get('input_content') or data.get('output_content'):
            single_test_case = True
            # Ensure both input and output are provided for single test case
            has_file_paths = data.get('input_file_path') and data.get('output_file_path')
            has_content = data.get('input_content') and data.get('output_content')
            
            if not (has_file_paths or has_content):
                raise serializers.ValidationError(
                    "For single test case: either both file paths or both content fields must be provided"
                )
            
            # Validate file existence if paths are provided
            if data.get('input_file_path') and not os.path.exists(data['input_file_path']):
                raise serializers.ValidationError(
                    f"Input file not found: {data['input_file_path']}"
                )
                
            if data.get('output_file_path') and not os.path.exists(data['output_file_path']):
                raise serializers.ValidationError(
                    f"Output file not found: {data['output_file_path']}"
                )
        
        # Validate multiple test cases
        test_cases = data.get('test_cases', [])
        if test_cases:
            for i, test_case in enumerate(test_cases):
                has_file_paths = test_case.get('input_file_path') and test_case.get('output_file_path')
                has_content = test_case.get('input_content') and test_case.get('output_content')
                
                if not (has_file_paths or has_content):
                    raise serializers.ValidationError(
                        f"Test case {i + 1}: either file paths or content must be provided"
                    )
                
                # Validate file existence if paths are provided
                if test_case.get('input_file_path') and not os.path.exists(test_case['input_file_path']):
                    raise serializers.ValidationError(
                        f"Test case {i + 1}: Input file not found: {test_case['input_file_path']}"
                    )
                    
                if test_case.get('output_file_path') and not os.path.exists(test_case['output_file_path']):
                    raise serializers.ValidationError(
                        f"Test case {i + 1}: Output file not found: {test_case['output_file_path']}"
                    )
        
        # Ensure at least one test case is provided (either single or multiple)
        if not single_test_case and not test_cases:
            raise serializers.ValidationError(
                "At least one test case must be provided"
            )
        
        return data

class TestCaseCreateSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(required=True)
    
    # Support both methods
    input_file_path = serializers.CharField(required=False)
    output_file_path = serializers.CharField(required=False)
    input_content = serializers.CharField(required=False)
    output_content = serializers.CharField(required=False)
    
    is_example = serializers.BooleanField(default=False)
    is_hidden = serializers.BooleanField(default=False)
    
    def validate(self, data):
        # Ensure either file paths or content is provided
        has_file_paths = data.get('input_file_path') and data.get('output_file_path')
        has_content = data.get('input_content') and data.get('output_content')
        
        if not (has_file_paths or has_content):
            raise serializers.ValidationError(
                "Either file paths (input_file_path, output_file_path) or content (input_content, output_content) must be provided"
            )
        
        # Validate file existence if paths are provided
        if data.get('input_file_path') and not os.path.exists(data['input_file_path']):
            raise serializers.ValidationError(
                f"Input file not found: {data['input_file_path']}"
            )
            
        if data.get('output_file_path') and not os.path.exists(data['output_file_path']):
            raise serializers.ValidationError(
                f"Output file not found: {data['output_file_path']}"
            )
        
        return data

