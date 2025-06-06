from django.db import models
import logging

logger = logging.getLogger(__name__)

class TestCase(models.Model):
    question = models.ForeignKey('questions.Question', on_delete=models.CASCADE, related_name='test_cases')
    input_s3_key = models.CharField(max_length=500, help_text="S3 key for input file")
    output_s3_key = models.CharField(max_length=500, help_text="S3 key for output file")
    is_example = models.BooleanField(default=False, help_text="Whether this is an example test case")
    is_hidden = models.BooleanField(default=False, help_text="Whether this test case is hidden from users")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"TestCase {self.id} for Question {self.question.id if self.question else 'None'}"

    

