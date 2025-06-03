from django.db import models
from utils.s3_service import s3_service
from django.conf import settings
import logging
from typing import Tuple, Optional
import os

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

    def generate_s3_keys(self) -> Tuple[str, str]:
        """Generate organized S3 keys for input/output files linked to question"""
        question_id = self.question.id if self.question else self.id
        
        input_key = f"{settings.S3_QUESTIONS_PREFIX}question_{question_id}/testcase_{self.id}/input.txt"
        output_key = f"{settings.S3_QUESTIONS_PREFIX}question_{question_id}/testcase_{self.id}/output.txt"
        return input_key, output_key

    def create_testcase_from_files(self, input_file_path: str, output_file_path: str) -> bool:
        """Create test case by uploading local files to S3"""
        try:
            # Validate file existence
            if not os.path.exists(input_file_path):
                raise FileNotFoundError(f"Input file not found: {input_file_path}")
            if not os.path.exists(output_file_path):
                raise FileNotFoundError(f"Output file not found: {output_file_path}")
            
            # Read local files
            with open(input_file_path, 'r', encoding='utf-8') as f:
                input_content = f.read()
            with open(output_file_path, 'r', encoding='utf-8') as f:
                output_content = f.read()
            
            # Use the content method to upload
            return self.create_testcase_from_content(input_content, output_content)
            
        except Exception as e:
            logger.error(f"Failed to create testcase {self.id} from files: {e}")
            return False

    def create_testcase_from_content(self, input_content: str, output_content: str) -> bool:
        """Create test case by uploading content directly to S3"""
        try:
            # Save to get ID
            if not self.pk:
                self.save()
            
            # Generate S3 keys
            input_key, output_key = self.generate_s3_keys()
            
            # Upload to S3
            if s3_service.upload_file(input_content, input_key, 'text/plain'):
                self.input_s3_key = input_key
            else:
                raise Exception("Failed to upload input content to S3")
                
            if s3_service.upload_file(output_content, output_key, 'text/plain'):
                self.output_s3_key = output_key
            else:
                raise Exception("Failed to upload output content to S3")
            
            # Save S3 keys
            self.save(update_fields=['input_s3_key', 'output_s3_key'])
            
            logger.info(f"TestCase {self.id} successfully created in S3")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create testcase {self.id}: {e}")
            return False

    def get_input_content(self) -> Optional[str]:
        """Retrieve input content from S3"""
        if self.input_s3_key:
            return s3_service.download_file(self.input_s3_key)
        return None

    def get_output_content(self) -> Optional[str]:
        """Retrieve output content from S3"""
        if self.output_s3_key:
            return s3_service.download_file(self.output_s3_key)
        return None

    def get_input_url(self) -> Optional[str]:
        """Generate presigned URL for input file"""
        if self.input_s3_key:
            return s3_service.generate_presigned_url(self.input_s3_key)
        return None

    def get_output_url(self) -> Optional[str]:
        """Generate presigned URL for output file"""
        if self.output_s3_key:
            return s3_service.generate_presigned_url(self.output_s3_key)
        return None

    def delete_from_s3(self) -> bool:
        """Delete test case files from S3"""
        success = True
        if self.input_s3_key:
            success &= s3_service.delete_file(self.input_s3_key)
        if self.output_s3_key:
            success &= s3_service.delete_file(self.output_s3_key)
        return success

    def delete(self, *args, **kwargs):
        """Override delete to clean up S3 files"""
        self.delete_from_s3()
        super().delete(*args, **kwargs)

