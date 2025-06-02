from django.db import models
import os

# Create your models here.
class TestCase(models.Model):
    input_path = models.CharField(max_length=2000)
    output_path = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"TestCase {self.id}"        
    
    def create_testcase_record(self, input_path, output_path):
        """Create test case record with paths only (no file creation)"""
        self.input_path = input_path
        self.output_path = output_path
        self.save()
        return self.input_path, self.output_path
    
    def genrate_input_output(self, input_data_path, output_data_path):
        """Create test case record with generated paths (NO FILE CREATION)"""
        # Save to get ID first
        self.save()
        
        # Generate paths without creating actual files or folders
        input_path = f"data/inputs/input{self.id}.txt"
        output_path = f"data/outputs/output{self.id}.txt"
        
        # Update fields and save (paths only)
        self.input_path = input_path
        self.output_path = output_path
        self.save(update_fields=['input_path', 'output_path'])
        
        return input_path, output_path

