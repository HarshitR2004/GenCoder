from django.db import models
from utils.s3_service import s3_service
from django.conf import settings
import logging
from typing import Optional, List
import os
from testcase.models import TestCase


logger = logging.getLogger(__name__)

class Topic(models.Model):
    TOPIC_CHOICES = (
        ('arrays', 'Arrays'),
        ('strings', 'Strings'),
        ('linked_lists', 'Linked Lists'),
        ('trees', 'Trees'),
        ('graphs', 'Graphs'),
        ('dynamic_programming', 'Dynamic Programming'),
        ('recursion', 'Recursion'),
        ('greedy', 'Greedy Algorithms'),
        ('backtracking', 'Backtracking'),
        ('sorting', 'Sorting'),
    )

    topic = models.CharField(max_length=100, choices=TOPIC_CHOICES, default='arrays')
    
    def __str__(self):
        return self.get_topic_display()
    
class Language(models.Model):
    LANGUAGE_CHOICES = (
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
    )
    
    name = models.CharField(max_length=100, default='python', choices=LANGUAGE_CHOICES)

    def __str__(self):
        return self.get_name_display()

class Question(models.Model):
    title = models.CharField(max_length=200)
    question_s3_key = models.CharField(max_length=500, null=True, blank=True, 
                                      help_text="S3 key for the markdown question file")
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='easy')
    created_at = models.DateTimeField(auto_now_add=True)
    
    languages = models.ManyToManyField('Language', related_name='questions', blank=True)
    topics = models.ManyToManyField('Topic', related_name='questions', blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['difficulty', 'created_at']),
            models.Index(fields=['title']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.id}: {self.title}"

    def generate_s3_key(self) -> str:
        """Generate organized S3 key for question markdown file"""
        return f"{settings.S3_QUESTIONS_PREFIX}question_{self.id}/question.md"

    def create_question_from_file(self, markdown_file_path: str) -> bool:
        """Create question by uploading local markdown file to S3"""
        try:
            # Validate file existence
            if not os.path.exists(markdown_file_path):
                raise FileNotFoundError(f"Markdown file not found: {markdown_file_path}")
            
            # Read local markdown file
            with open(markdown_file_path, 'r', encoding='utf-8') as f:
                markdown_content = f.read()
            
            # Use the content method to upload
            return self.create_question_from_content(markdown_content)
            
        except Exception as e:
            logger.error(f"Failed to create question {self.id} from file: {e}")
            return False

    def create_question_from_content(self, markdown_content: str) -> bool:
        """Create question by uploading content directly to S3"""
        try:
            if not self.pk:
                self.save()
            
            s3_key = self.generate_s3_key()
            
            if s3_service.upload_file(markdown_content, s3_key, 'text/markdown'):
                self.question_s3_key = s3_key
                self.save(update_fields=['question_s3_key'])
                logger.info(f"Question {self.id} successfully created in S3")
                return True
            else:
                raise Exception("Failed to upload question to S3")
                
        except Exception as e:
            logger.error(f"Failed to create question {self.id}: {e}")
            return False

    def get_question_content(self) -> Optional[str]:
        """Retrieve question markdown content from S3"""
        if self.question_s3_key:
            return s3_service.download_file(self.question_s3_key)
        return None

    def get_question_url(self) -> Optional[str]:
        """Generate presigned URL for question markdown file"""
        if self.question_s3_key:
            return s3_service.generate_presigned_url(self.question_s3_key)
        return None

    def get_all_test_cases(self) -> List['TestCase']:
        """Get all test cases for this question"""
        return self.test_cases.all()

    def get_complete_question_data(self) -> dict:
        """Get complete question data including all test cases"""
        data = {
            'id': self.id,
            'title': self.title,
            'difficulty': self.difficulty,
            'question_content': self.get_question_content(),
            'question_url': self.get_question_url(),
            'languages': [lang.name for lang in self.languages.all()],
            'topics': [topic.topic for topic in self.topics.all()],
            'created_at': self.created_at,
        }
        
        test_cases = self.get_all_test_cases()
        data['test_cases'] = [
            {
                'id': tc.id,
                'input_content': tc.get_input_content(),
                'output_content': tc.get_output_content(),
                'input_url': tc.get_input_url(),
                'output_url': tc.get_output_url(),
                'is_example': tc.is_example,
                'is_hidden': tc.is_hidden,
            }
            for tc in test_cases
        ]
        
        return data

    def add_test_case_from_content(self, input_content: str, output_content: str, is_example: bool = False, is_hidden: bool = False) -> 'TestCase':
        """Add a new test case to this question from content"""
        
        test_case = TestCase(
            question=self,
            is_example=is_example,
            is_hidden=is_hidden
        )
        success = test_case.create_testcase_from_content(input_content, output_content)
        
        if success:
            return test_case
        else:
            raise Exception("Failed to create test case from content")

    def add_test_case_from_files(self, input_file_path: str, output_file_path: str, is_example: bool = False, is_hidden: bool = False) -> 'TestCase':
        """Add a new test case to this question from files"""
        
        test_case = TestCase(
            question=self,
            is_example=is_example,
            is_hidden=is_hidden
        )
        success = test_case.create_testcase_from_files(input_file_path, output_file_path)
        
        if success:
            return test_case
        else:
            raise Exception("Failed to create test case from files")

    def delete_from_s3(self) -> bool:
        """Delete question file from S3"""
        if self.question_s3_key:
            return s3_service.delete_file(self.question_s3_key)
        return True

    def delete(self, *args, **kwargs):
        """Override delete to clean up S3 files"""
        self.delete_from_s3()
        super().delete(*args, **kwargs)






