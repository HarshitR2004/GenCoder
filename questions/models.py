from django.db import models
from django.conf import settings
import logging


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

    topic = models.CharField(max_length=100, choices=TOPIC_CHOICES, default='arrays', unique=True)
    
    def __str__(self):
        return self.get_topic_display()
    
class Language(models.Model):
    LANGUAGE_CHOICES = (
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
    )
    
    name = models.CharField(max_length=100, default='python', choices=LANGUAGE_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()

class Question(models.Model):
    title = models.CharField(max_length=200, blank=False,)
    question_s3_key = models.CharField(max_length=500, null=True, blank=True, 
                                      help_text="S3 key for the markdown question file")
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='easy')
    created_at = models.DateTimeField(auto_now_add=True)
    
    languages = models.ManyToManyField('Language', related_name='questions')
    topics = models.ManyToManyField('Topic', related_name='questions')
    
    class Meta:
        indexes = [
            models.Index(fields=['difficulty', 'created_at']),
            models.Index(fields=['title']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.id}: {self.title}"

class Code(models.Model):
    question = models.ForeignKey(Question, related_name='codes', on_delete=models.CASCADE)
    language = models.ForeignKey(Language, related_name='codes', on_delete=models.CASCADE)
    code_s3_key = models.TextField(max_length=500, null=False, blank=False,
                                   help_text="S3 key for the code file")
    
    
    class Meta:
        unique_together = ('question', 'language')  #constraint to ensure one code per question and language
        
    def __str__(self):
        return f"{self.question.title} - {self.language.get_name_display()}"










