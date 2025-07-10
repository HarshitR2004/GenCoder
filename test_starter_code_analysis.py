#!/usr/bin/env python3
"""
Test script for starter code analysis functionality.
This demonstrates how the Judge class can automatically detect problem types
from function signatures in starter code.
"""

import sys
import os

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.judge.Judge import Judge

def test_starter_code_analysis():
    """Test the starter code analysis functionality."""
    
    judge = Judge()
    
    # Test cases with different function signatures
    test_cases = [
        {
            "name": "Two Integer Parameters",
            "starter_code": {
                "python": "def solution(a, b):\n    return a + b",
                "java": "public class Solution {\n    public int solution(int a, int b) {\n        return a + b;\n    }\n}",
                "cpp": "int solution(int a, int b) {\n    return a + b;\n}"
            },
            "expected": "function_only_int"
        },
        {
            "name": "Array Parameter",
            "starter_code": {
                "python": "def solution(nums):\n    return sum(nums)",
                "java": "public class Solution {\n    public int solution(int[] nums) {\n        return 0;\n    }\n}",
                "cpp": "#include <vector>\nusing namespace std;\n\nint solution(vector<int>& nums) {\n    return 0;\n}"
            },
            "expected": "function_only_array"
        },
        {
            "name": "String Parameter",
            "starter_code": {
                "python": "def solution(word):\n    return word.upper()",
                "java": "public class Solution {\n    public String solution(String word) {\n        return word;\n    }\n}",
                "cpp": "#include <string>\nusing namespace std;\n\nstring solution(string word) {\n    return word;\n}"
            },
            "expected": "function_only_string"
        },
        {
            "name": "Python with Type Hints",
            "starter_code": {
                "python": "from typing import List\n\ndef solution(nums: List[int]) -> int:\n    return len(nums)",
                "java": "public class Solution {\n    public int solution(int[] nums) {\n        return nums.length;\n    }\n}",
                "cpp": "#include <vector>\nusing namespace std;\n\nint solution(vector<int>& nums) {\n    return nums.size();\n}"
            },
            "expected": "function_only_array"
        }
    ]
    
    print("Testing Starter Code Analysis")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['name']}")
        print("-" * 30)
        
        # Analyze the starter code
        analysis = judge.analyze_starter_code(test_case['starter_code'])
        
        print(f"Expected: {test_case['expected']}")
        print(f"Detected: {analysis['detected_problem_type']}")
        print(f"Confidence: {analysis['confidence']:.2f}")
        
        # Check if detection was correct
        is_correct = analysis['detected_problem_type'] == test_case['expected']
        status = "CORRECT" if is_correct else "INCORRECT"
        print(f"Status: {status}")
        
        # Show language-specific analysis
        print("\nLanguage Analysis:")
        for lang, lang_analysis in analysis['language_analysis'].items():
            method = lang_analysis.get('regex_analysis', {}).get('method', 'N/A')
            detected = lang_analysis.get('detected_type', 'None')
            confidence = lang_analysis.get('confidence', 0)
            print(f"  {lang}: {detected} (confidence: {confidence:.2f})")
        
        # Show voting results
        if analysis['problem_type_votes']:
            print("\nVoting Results:")
            for problem_type, votes_data in analysis['problem_type_votes'].items():
                avg_conf = votes_data['total_confidence'] / votes_data['votes']
                print(f"  {problem_type}: {votes_data['votes']} votes (avg confidence: {avg_conf:.2f})")
    
    print("\n" + "=" * 50)
    print("Testing Problem Type Recommendations")
    print("=" * 50)
    
    # Test recommendation functionality
    for i, test_case in enumerate(test_cases, 1):
        recommended = judge.get_recommended_problem_type(test_case['starter_code'])
        is_correct = recommended == test_case['expected']
        status = "PASS" if is_correct else "FAIL"
        print(f"{status} Test {i}: Recommended '{recommended}' (expected '{test_case['expected']}')")
    
    print("\n" + "=" * 50)
    print("Testing Problem Type Validation")
    print("=" * 50)
    
    # Test validation functionality
    test_validation = test_cases[0]  # Use first test case
    
    # Test with correct problem type
    validation = judge.validate_problem_type_compatibility(
        test_validation['starter_code'], 
        test_validation['expected']
    )
    print(f"Validation with correct type: Compatible = {validation['is_compatible']}")
    
    # Test with incorrect problem type
    validation = judge.validate_problem_type_compatibility(
        test_validation['starter_code'], 
        'function_only_string'  # Wrong type
    )
    print(f"Validation with wrong type: Compatible = {validation['is_compatible']}")
    if validation['suggestions']:
        print(f"   Suggestions: {', '.join(validation['suggestions'])}")

def demo_real_world_usage():
    """Demonstrate how this would be used in practice."""
    
    print("\n" + "=" * 50)
    print("Real-World Usage Example")
    print("=" * 50)
    
    judge = Judge()
    
    # Simulate starter code from your StarterCodeService
    starter_code_from_form = {
        "python": "def solution(nums):\n    # Your code here\n    pass",
        "java": "public class Solution {\n    public int solution(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <vector>\nusing namespace std;\n\nint solution(vector<int>& nums) {\n    // Your code here\n    return 0;\n}"
    }
    
    # Automatically detect problem type
    recommended_type = judge.get_recommended_problem_type(starter_code_from_form)
    print(f"Recommended problem type: {recommended_type}")
    
    # Get detailed analysis for debugging/logging
    analysis = judge.analyze_starter_code(starter_code_from_form)
    print(f"Analysis confidence: {analysis['confidence']:.2f}")
    print(f"Languages analyzed: {analysis['total_languages_analyzed']}")
    
    # Validate compatibility (useful for admin interface)
    validation = judge.validate_problem_type_compatibility(
        starter_code_from_form, 
        recommended_type
    )
    print(f"Compatibility check: {validation['is_compatible']}")
    
    print("\nThis analysis can be integrated into:")
    print("   - Question creation forms (auto-select problem type)")
    print("   - Admin interface (validation warnings)")
    print("   - API endpoints (automatic problem type detection)")
    print("   - Test case validation (ensure compatibility)")

def demo_enhanced_analysis():
    """Demonstrate enhanced analysis features."""
    
    print("\n" + "=" * 50)
    print("Enhanced Analysis Features")
    print("=" * 50)
    
    judge = Judge()
    
    # Test quality analysis
    print("\nQuality Analysis:")
    print("-" * 20)
    
    # Good quality starter code
    good_starter_code = {
        "python": "from typing import List\n\ndef solution(nums: List[int]) -> int:\n    # Find maximum element\n    return max(nums)",
        "java": "public class Solution {\n    public int solution(int[] nums) {\n        // Find maximum element\n        return Arrays.stream(nums).max().orElse(0);\n    }\n}",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solution(vector<int>& nums) {\n    // Find maximum element\n    return *max_element(nums.begin(), nums.end());\n}"
    }
    
    quality_analysis = judge.analyze_and_suggest_improvements(good_starter_code)
    print(f"Quality Score: {quality_analysis['overall_quality']['score']:.1f}/100")
    print(f"Quality Level: {quality_analysis['overall_quality']['level'].upper()}")
    print(f"Description: {quality_analysis['overall_quality']['description']}")
    
    if quality_analysis['suggestions']:
        print("\nSuggestions:")
        for suggestion in quality_analysis['suggestions']:
            emoji = {"error": "ERROR", "warning": "WARNING", "info": "INFO"}.get(suggestion['severity'], "NOTE")
            print(f"  {emoji}: {suggestion['message']}")
    else:
        print("\nNo suggestions - excellent starter code!")
    
    # Test with problematic starter code
    print("\nTesting Problematic Code:")
    print("-" * 30)
    
    problematic_code = {
        "python": "def solution(x):",  # Minimal/incomplete
        "java": "public int solution(String word) { return 0; }"  # Inconsistent with python
        # Missing C++
    }
    
    problem_analysis = judge.analyze_and_suggest_improvements(problematic_code)
    print(f"Quality Score: {problem_analysis['overall_quality']['score']:.1f}/100")
    print(f"Quality Level: {problem_analysis['overall_quality']['level'].upper()}")
    
    print("\nIssues Found:")
    for suggestion in problem_analysis['suggestions']:
        emoji = {"error": "ERROR", "warning": "WARNING", "info": "INFO"}.get(suggestion['severity'], "NOTE")
        print(f"  {emoji}: {suggestion['message']}")
    
    # Test problem type recommendation from description
    print("\nProblem Type Recommendations from Descriptions:")
    print("-" * 50)
    
    test_descriptions = [
        "Find the maximum element in an array of integers",
        "Check if a string is a palindrome",
        "Calculate the sum of two numbers",
        "Sort an array in ascending order",
        "Count the number of vowels in a word"
    ]
    
    for description in test_descriptions:
        recommended = judge.get_template_recommendation(description)
        print(f"'{description}'")
        print(f"   -> Recommended: {recommended}")
    
    # Show supported problem types
    print("\nSupported Problem Types:")
    print("-" * 30)
    
    supported_types = judge.get_supported_problem_types()
    for prob_type in supported_types:
        print(f"\n{prob_type['name']} ({prob_type['type']})")
        print(f"   Description: {prob_type['description']}")
        print(f"   Example: {prob_type['example_signature']}")
        print(f"   Use cases: {', '.join(prob_type['use_cases'])}")

if __name__ == "__main__":
    print("GenCoder Starter Code Analysis Demo")
    print("Testing automatic problem type detection from function signatures")
    
    try:
        test_starter_code_analysis()
        demo_real_world_usage()
        demo_enhanced_analysis()
        
        print("\nAll tests completed successfully!")        
    except Exception as e:
        print(f"\nError during testing: {str(e)}")
        import traceback
        traceback.print_exc()
