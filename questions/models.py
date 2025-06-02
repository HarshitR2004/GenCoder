from django.db import models
from testcase.models import TestCase
import os
import shutil

class Language(models.Model):
    
    LANGUAGE_CHOICES = (
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
    )
    
    name = models.CharField(max_length=100, default='python', choices=LANGUAGE_CHOICES)

    def __str__(self):
        return self.name  

class Question(models.Model):
    title = models.CharField(max_length=200)                                    
    question_path = models.CharField(max_length=500, null=True, blank=True, help_text="Path to the markdown file containing the question statement")                            
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='easy')
    created_at = models.DateTimeField(auto_now_add=True)  
    test_cases = models.ForeignKey(TestCase, on_delete=models.CASCADE, related_name='questions')
    languages = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='questions', default=1)
    
    def __str__(self):
        return f"{self.id}: {self.title}"

    def add_files_from_markdown(self, markdown_file_path, input_data_path, output_data_path):
        """Create question record and actual files in database folder structure"""
        
        # Validate that source files exist
        if not os.path.exists(markdown_file_path):
            raise FileNotFoundError(f"Markdown file not found: {markdown_file_path}")
        
        if not os.path.exists(input_data_path):
            raise FileNotFoundError(f"Input file not found: {input_data_path}")
            
        if not os.path.exists(output_data_path):
            raise FileNotFoundError(f"Output file not found: {output_data_path}")
        
        # Save to get ID if not saved
        if not self.pk:
            self.save()
        
        # Create database folder structure
        question_folder = f"database/question{self.id}"
        inputs_folder = f"{question_folder}/inputs"
        outputs_folder = f"{question_folder}/outputs"
        
        # Create directories
        os.makedirs(inputs_folder, exist_ok=True)
        os.makedirs(outputs_folder, exist_ok=True)
        
        # Generate file paths
        question_file_path = f"{question_folder}/question{self.id}.md"
        input_file_path = f"{inputs_folder}/input{self.id}.txt"
        output_file_path = f"{outputs_folder}/output{self.id}.txt"
        
        # Copy and create actual files with content
        shutil.copy2(markdown_file_path, question_file_path)
        shutil.copy2(input_data_path, input_file_path)
        shutil.copy2(output_data_path, output_file_path)
        
        # Update model field to store the path
        self.question_path = question_file_path
        self.save(update_fields=['question_path'])
        
        # Verify files were created
        print(f"Created files:")
        print(f"  - {question_file_path} (exists: {os.path.exists(question_file_path)})")
        print(f"  - {input_file_path} (exists: {os.path.exists(input_file_path)})")
        print(f"  - {output_file_path} (exists: {os.path.exists(output_file_path)})")
         
        return question_file_path, input_file_path, output_file_path

    def generate_question_folder(self, database_path='database'):
        """Create actual question folder structure"""
        
        # Save first to get ID if not saved
        if not self.pk:
            self.save()
            
        # Create folder paths
        question_folder = os.path.join(database_path, f'question{self.id}')
        inputs_folder = os.path.join(question_folder, 'inputs')
        outputs_folder = os.path.join(question_folder, 'outputs')
        
        # Create actual directories
        os.makedirs(inputs_folder, exist_ok=True)
        os.makedirs(outputs_folder, exist_ok=True)
        
        return question_folder, inputs_folder, outputs_folder

    def get_question_statement(self):
        """Read question statement from markdown file."""
        if self.question_path and os.path.exists(self.question_path):
            with open(self.question_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None

    def get_input_content(self):
        """Read input content from file."""
        if not self.question_path:
            return None
        input_path = self.question_path.replace('question', 'inputs/input').replace('.md', '.txt')
        if os.path.exists(input_path):
            with open(input_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None

    def get_output_content(self):
        """Read output content from file."""
        if not self.question_path:
            return None
        output_path = self.question_path.replace('question', 'outputs/output').replace('.md', '.txt')
        if os.path.exists(output_path):
            with open(output_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None




