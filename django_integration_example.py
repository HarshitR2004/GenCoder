"""
Django integration example for starter code analysis.
This shows how to integrate the Judge's analysis capabilities into your Django backend.
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from utils.judge.Judge import Judge

@api_view(['POST'])
def analyze_starter_code(request):
    """
    API endpoint to analyze starter code and detect problem type.
    
    Expected JSON payload:
    {
        "starter_code": {
            "python": "def solution(nums): ...",
            "java": "public class Solution { ... }",
            "cpp": "int solution(vector<int>& nums) { ... }"
        }
    }
    """
    try:
        starter_code = request.data.get('starter_code', {})
        
        if not starter_code:
            return Response(
                {'error': 'starter_code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        judge = Judge()
        
        # Perform comprehensive analysis
        analysis = judge.analyze_and_suggest_improvements(starter_code)
        
        # Get recommended problem type
        recommended_type = judge.get_recommended_problem_type(starter_code)
        
        return Response({
            'success': True,
            'recommended_problem_type': recommended_type,
            'analysis': {
                'detected_type': analysis['detected_problem_type'],
                'confidence': analysis['confidence'],
                'quality_score': analysis['overall_quality']['score'],
                'quality_level': analysis['overall_quality']['level'],
                'quality_description': analysis['overall_quality']['description'],
                'suggestions': analysis['suggestions'],
                'languages_analyzed': analysis['total_languages_analyzed'],
                'language_details': analysis['language_analysis']
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Analysis failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def validate_problem_type(request):
    """
    API endpoint to validate if a problem type is compatible with starter code.
    
    Expected JSON payload:
    {
        "starter_code": { ... },
        "problem_type": "function_only_array"
    }
    """
    try:
        starter_code = request.data.get('starter_code', {})
        problem_type = request.data.get('problem_type')
        
        if not starter_code or not problem_type:
            return Response(
                {'error': 'starter_code and problem_type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        judge = Judge()
        validation = judge.validate_problem_type_compatibility(starter_code, problem_type)
        
        return Response({
            'success': True,
            'is_compatible': validation['is_compatible'],
            'confidence': validation['confidence'],
            'detected_type': validation['detected_type'],
            'specified_type': validation['specified_type'],
            'suggestions': validation['suggestions']
        })
        
    except Exception as e:
        return Response(
            {'error': f'Validation failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_supported_problem_types(request):
    """
    API endpoint to get all supported problem types.
    """
    try:
        judge = Judge()
        supported_types = judge.get_supported_problem_types()
        
        return Response({
            'success': True,
            'problem_types': supported_types
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get problem types: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def recommend_problem_type_from_description(request):
    """
    API endpoint to recommend problem type based on problem description.
    
    Expected JSON payload:
    {
        "description": "Find the maximum element in an array"
    }
    """
    try:
        description = request.data.get('description', '')
        
        judge = Judge()
        recommended_type = judge.get_template_recommendation(description)
        
        return Response({
            'success': True,
            'recommended_type': recommended_type,
            'description': description
        })
        
    except Exception as e:
        return Response(
            {'error': f'Recommendation failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Example of how to integrate into your existing Question model
"""
# In your models.py
class Question(models.Model):
    # ...existing fields...
    problem_type = models.CharField(
        max_length=50, 
        choices=[
            ('function_only_int', 'Integer Function'),
            ('function_only_array', 'Array Function'),
            ('function_only_string', 'String Function'),
        ],
        default='function_only_int',
        help_text='Automatically detected from starter code'
    )
    
    def analyze_starter_code(self):
        \"\"\"Analyze starter code and update problem type.\"\"\"
        if self.starter_code:
            judge = Judge()
            recommended_type = judge.get_recommended_problem_type(self.starter_code)
            self.problem_type = recommended_type
            return recommended_type
        return None
    
    def save(self, *args, **kwargs):
        # Auto-detect problem type if not set
        if not self.problem_type and self.starter_code:
            self.analyze_starter_code()
        super().save(*args, **kwargs)
"""

# Example URLs configuration
"""
# In your urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ...existing URLs...
    path('api/analyze-starter-code/', views.analyze_starter_code, name='analyze_starter_code'),
    path('api/validate-problem-type/', views.validate_problem_type, name='validate_problem_type'),
    path('api/problem-types/', views.get_supported_problem_types, name='get_problem_types'),
    path('api/recommend-problem-type/', views.recommend_problem_type_from_description, name='recommend_problem_type'),
]
"""

# Example frontend integration (JavaScript)
"""
// In your QuestionForm.jsx or similar component

const analyzeStarterCode = async (starterCode) => {
    try {
        const response = await fetch('/api/analyze-starter-code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                starter_code: starterCode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Auto-select the recommended problem type
            setProblemType(data.recommended_problem_type);
            
            // Show quality feedback to user
            if (data.analysis.quality_level !== 'excellent') {
                setQualityFeedback(data.analysis.suggestions);
            }
            
            // Show confidence level
            setConfidence(data.analysis.confidence);
        }
    } catch (error) {
        console.error('Starter code analysis failed:', error);
    }
};

// Call this when starter code changes
useEffect(() => {
    if (starterCode && Object.keys(starterCode).length > 0) {
        analyzeStarterCode(starterCode);
    }
}, [starterCode]);
"""
