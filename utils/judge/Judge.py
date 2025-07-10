import requests
import ast
import re
import inspect
from typing import Dict, List, Tuple, Optional, Any

class Judge:
    
    FILE_NAMES = {
        "python": "solution.py",
        "java": "Solution.java",
        "cpp": "solution.cpp"
    }
    
    VERSIONS = {
        "python": "3.12.0",
        "java": "11",
        "cpp": "11"
    }
    
    # Problem type mapping based on function signatures
    PROBLEM_TYPE_MAPPINGS = {
        # Python patterns
        'python': {
            # Two integer parameters returning integer
            r'def\s+solution\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:': 'function_only_int',
            # Three integer parameters returning integer  
            r'def\s+solution\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)\s*:': 'function_only_int',
            # Array/list parameter patterns
            r'def\s+solution\s*\(\s*\w*(?:nums|arr|array|list)\w*\s*\)\s*:': 'function_only_array',
            r'def\s+solution\s*\(\s*\w+\s*:\s*List\[int\]\s*\)\s*:': 'function_only_array',
            r'def\s+solution\s*\(\s*\w+\s*:\s*list\s*\)\s*:': 'function_only_array',
            # String parameter patterns
            r'def\s+solution\s*\(\s*\w*(?:word|text|string|str|name)\w*\s*\)\s*:': 'function_only_string',
            r'def\s+solution\s*\(\s*\w+\s*:\s*str\s*\)\s*:': 'function_only_string',
        },
        # Java patterns
        'java': {
            # Two integer parameters
            r'public\s+int\s+solution\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)': 'function_only_int',
            # Three integer parameters
            r'public\s+int\s+solution\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s+\w+\s*\)': 'function_only_int',
            # Array parameters
            r'public\s+int\s+solution\s*\(\s*int\[\]\s+\w+\s*\)': 'function_only_array',
            r'public\s+\w+\s+solution\s*\(\s*int\[\]\s+\w+\s*\)': 'function_only_array',
            # String parameters
            r'public\s+String\s+solution\s*\(\s*String\s+\w+\s*\)': 'function_only_string',
            r'public\s+\w+\s+solution\s*\(\s*String\s+\w+\s*\)': 'function_only_string',
        },
        # C++ patterns
        'cpp': {
            # Two integer parameters
            r'int\s+solution\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)': 'function_only_int',
            # Three integer parameters
            r'int\s+solution\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s+\w+\s*\)': 'function_only_int',
            # Vector/array parameters
            r'\w*\s+solution\s*\(\s*vector<int>\s*&?\s*\w+\s*\)': 'function_only_array',
            r'\w*\s+solution\s*\(\s*vector<\w+>\s*&?\s*\w+\s*\)': 'function_only_array',
            r'\w*\s+solution\s*\(\s*int\s+\w+\[\]\s*\)': 'function_only_array',
            # String parameters
            r'string\s+solution\s*\(\s*string\s+\w+\s*\)': 'function_only_string',
            r'\w*\s+solution\s*\(\s*string\s*&?\s*\w+\s*\)': 'function_only_string',
        }
    }
    
    # Parameter type hints for advanced analysis
    TYPE_HINTS = {
        'python': {
            'int': ['int', 'Integer'],
            'string': ['str', 'string', 'String'],
            'array': ['List[int]', 'list', 'List', 'Array'],
            'string_array': ['List[str]', 'List[string]']
        },
        'java': {
            'int': ['int', 'Integer'],
            'string': ['String'],
            'array': ['int[]', 'Integer[]', 'ArrayList<Integer>'],
            'string_array': ['String[]', 'ArrayList<String>']
        },
        'cpp': {
            'int': ['int', 'long', 'long long'],
            'string': ['string', 'std::string'],
            'array': ['vector<int>', 'vector<long>', 'int[]', 'int*'],
            'string_array': ['vector<string>', 'vector<std::string>', 'string[]']
        }
    }
    
    def load_template(self, language, problem_type):
        """
        Load the template code for the specified language and type.
        """
        try:
            with open(f'utils/judge/wrappers/{language}/{problem_type}.txt', 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            raise Exception(f"Template for {language} and type {problem_type} not found.")
        except Exception as e:
            raise Exception(f"An error occurred while loading the template: {str(e)}")
    
    def inject_template(self, user_code, language, problem_type):
        """
        Inject the user code into the template.
        """
        template_code = self.load_template(language, problem_type)
        final_code = template_code.replace("<USER_CODE>", user_code)
        return final_code
    
    def execute_code(self, user_code, language, problem_type, args=[]):
        """
        Execute user code using the judge service.
        
        """
        url = 'http://localhost:2000/api/v2/execute'
        
        if language not in self.VERSIONS:
            raise ValueError(f"Unsupported language: {language}")
        
        wrapper_code = self.inject_template(user_code, language, problem_type)
        
        files = []
        
        if language == "python":
            files = [
                {"name": "main.py", "content": wrapper_code},
                {"name": "solution.py", "content": user_code}
            ]
        else:
            files = [
                {"name": self.FILE_NAMES[language], "content": wrapper_code}
            ]
            
        payload = {
            "language": language,
            "version": self.VERSIONS[language],
            "files": files,
            "stdin": "",
            "args": args,
            "compile_timeout": 10000,
            "run_timeout": 3000,
            "compile_memory_limit": -1,
            "run_memory_limit": -1
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Judge service error: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error: {str(e)}")
    
    def analyze_starter_code(self, starter_code: Dict[str, str]) -> Dict[str, Any]:
        """
        Analyze starter code across all languages to determine problem type.
        
        Args:
            starter_code: Dictionary mapping language names to their starter code strings
            
        Returns:
            Dictionary containing analysis results including detected problem type,
            confidence scores, and detailed analysis for each language
        """
        analysis_results = {}
        problem_type_votes = {}
        
        for language, code in starter_code.items():
            if not code or not code.strip():
                continue
                
            lang_analysis = self._analyze_language_code(language, code)
            analysis_results[language] = lang_analysis
            
            # Count votes for each detected problem type
            if lang_analysis['detected_type']:
                problem_type = lang_analysis['detected_type']
                confidence = lang_analysis['confidence']
                
                if problem_type not in problem_type_votes:
                    problem_type_votes[problem_type] = {'votes': 0, 'total_confidence': 0}
                
                problem_type_votes[problem_type]['votes'] += 1
                problem_type_votes[problem_type]['total_confidence'] += confidence
        
        # Determine the most likely problem type
        best_type = None
        best_score = 0
        
        for problem_type, votes_data in problem_type_votes.items():
            # Calculate weighted score: (votes * average_confidence)
            avg_confidence = votes_data['total_confidence'] / votes_data['votes']
            weighted_score = votes_data['votes'] * avg_confidence
            
            if weighted_score > best_score:
                best_score = weighted_score
                best_type = problem_type
        
        return {
            'detected_problem_type': best_type,
            'confidence': best_score / len([r for r in analysis_results.values() if r['detected_type']]) if analysis_results else 0,
            'language_analysis': analysis_results,
            'problem_type_votes': problem_type_votes,
            'total_languages_analyzed': len(analysis_results)
        }
    
    def _analyze_language_code(self, language: str, code: str) -> Dict[str, Any]:
        """
        Analyze starter code for a specific language.
        
        Args:
            language: Programming language name
            code: Source code to analyze
            
        Returns:
            Dictionary containing analysis results for this language
        """
        if language not in self.PROBLEM_TYPE_MAPPINGS:
            return {
                'detected_type': None,
                'confidence': 0,
                'matches': [],
                'error': f'Language {language} not supported for analysis'
            }
        
        # Use both regex pattern matching and AST parsing
        regex_result = self._analyze_with_regex(language, code)
        ast_result = self._analyze_with_ast(language, code)
        
        # Combine results with weighted confidence
        combined_result = self._combine_analysis_results(regex_result, ast_result)
        
        return combined_result
    
    def _analyze_with_regex(self, language: str, code: str) -> Dict[str, Any]:
        """
        Analyze code using regex pattern matching.
        """
        patterns = self.PROBLEM_TYPE_MAPPINGS[language]
        matches = []
        
        for pattern, problem_type in patterns.items():
            if re.search(pattern, code, re.MULTILINE | re.IGNORECASE):
                matches.append({
                    'pattern': pattern,
                    'problem_type': problem_type,
                    'confidence': 0.8  # Base confidence for regex matches
                })
        
        # Determine best match
        if matches:
            # If multiple matches, prefer more specific patterns (longer patterns)
            best_match = max(matches, key=lambda x: len(x['pattern']))
            return {
                'method': 'regex',
                'detected_type': best_match['problem_type'],
                'confidence': best_match['confidence'],
                'matches': matches
            }
        
        return {
            'method': 'regex',
            'detected_type': None,
            'confidence': 0,
            'matches': []
        }
    
    def _analyze_with_ast(self, language: str, code: str) -> Dict[str, Any]:
        """
        Analyze code using AST parsing (primarily for Python).
        """
        if language != 'python':
            return {
                'method': 'ast',
                'detected_type': None,
                'confidence': 0,
                'error': f'AST analysis not implemented for {language}'
            }
        
        try:
            tree = ast.parse(code)
            
            # Find function definitions
            functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            solution_functions = [f for f in functions if f.name == 'solution']
            
            if not solution_functions:
                return {
                    'method': 'ast',
                    'detected_type': None,
                    'confidence': 0,
                    'error': 'No solution function found'
                }
            
            # Analyze the main solution function
            func = solution_functions[0]
            param_analysis = self._analyze_function_parameters(func)
            
            # Determine problem type based on parameters
            problem_type = self._infer_problem_type_from_params(param_analysis)
            
            return {
                'method': 'ast',
                'detected_type': problem_type,
                'confidence': 0.9 if problem_type else 0,
                'parameter_analysis': param_analysis,
                'function_name': func.name,
                'parameter_count': len(func.args.args)
            }
            
        except SyntaxError as e:
            return {
                'method': 'ast',
                'detected_type': None,
                'confidence': 0,
                'error': f'Syntax error in Python code: {str(e)}'
            }
        except Exception as e:
            return {
                'method': 'ast',
                'detected_type': None,
                'confidence': 0,
                'error': f'AST parsing error: {str(e)}'
            }
    
    def _analyze_function_parameters(self, func_node: ast.FunctionDef) -> Dict[str, Any]:
        """
        Analyze function parameters using AST.
        """
        params = []
        
        for arg in func_node.args.args:
            param_info = {
                'name': arg.arg,
                'type_hint': None,
                'inferred_type': None
            }
            
            # Extract type hints if present
            if arg.annotation:
                param_info['type_hint'] = ast.unparse(arg.annotation) if hasattr(ast, 'unparse') else str(arg.annotation)
            
            # Infer type from parameter name
            param_info['inferred_type'] = self._infer_type_from_name(arg.arg)
            
            params.append(param_info)
        
        return {
            'parameters': params,
            'parameter_count': len(params),
            'has_type_hints': any(p['type_hint'] for p in params)
        }
    
    def _infer_type_from_name(self, param_name: str) -> str:
        """
        Infer parameter type from variable name patterns.
        """
        name_lower = param_name.lower()
        
        # Array/list patterns
        if any(keyword in name_lower for keyword in ['nums', 'arr', 'array', 'list', 'items']):
            return 'array'
        
        # String patterns
        if any(keyword in name_lower for keyword in ['word', 'text', 'string', 'str', 'name', 'char']):
            return 'string'
        
        # Integer patterns (default for single letters or number-related names)
        if len(param_name) == 1 or any(keyword in name_lower for keyword in ['num', 'count', 'size', 'len', 'val', 'n', 'm', 'k']):
            return 'int'
        
        return 'unknown'
    
    def _infer_problem_type_from_params(self, param_analysis: Dict[str, Any]) -> Optional[str]:
        """
        Infer problem type from parameter analysis.
        """
        params = param_analysis['parameters']
        param_count = param_analysis['parameter_count']
        
        if param_count == 0:
            return None
        
        # Single parameter
        if param_count == 1:
            param_type = params[0]['inferred_type'] or 'unknown'
            type_hint = params[0]['type_hint'] or ''
            
            if param_type == 'array' or 'List' in type_hint or 'list' in type_hint:
                return 'function_only_array'
            elif param_type == 'string' or 'str' in type_hint:
                return 'function_only_string'
            else:
                return 'function_only_int'  # Default for single param
        
        # Multiple parameters
        elif param_count in [2, 3]:
            # Check if all parameters seem to be integers
            int_like_params = sum(1 for p in params if p['inferred_type'] == 'int' or 
                                p['type_hint'] in ['int', 'Integer'])
            
            if int_like_params == param_count:
                return 'function_only_int'
        
        # Default fallback
        return 'function_only_int'
    
    def _combine_analysis_results(self, regex_result: Dict, ast_result: Dict) -> Dict[str, Any]:
        """
        Combine results from regex and AST analysis.
        """
        # If both methods agree, increase confidence
        if (regex_result['detected_type'] == ast_result['detected_type'] and 
            regex_result['detected_type'] is not None):
            return {
                'detected_type': regex_result['detected_type'],
                'confidence': min(0.95, (regex_result['confidence'] + ast_result['confidence']) / 2 + 0.1),
                'regex_analysis': regex_result,
                'ast_analysis': ast_result,
                'agreement': True
            }
        
        # If they disagree, prefer AST result for Python (more accurate)
        elif ast_result['detected_type'] and regex_result['detected_type']:
            return {
                'detected_type': ast_result['detected_type'],
                'confidence': ast_result['confidence'] * 0.8,  # Reduce confidence due to disagreement
                'regex_analysis': regex_result,
                'ast_analysis': ast_result,
                'agreement': False
            }
        
        # Use whichever method found a result
        elif ast_result['detected_type']:
            return {
                'detected_type': ast_result['detected_type'],
                'confidence': ast_result['confidence'],
                'regex_analysis': regex_result,
                'ast_analysis': ast_result,
                'agreement': None
            }
        elif regex_result['detected_type']:
            return {
                'detected_type': regex_result['detected_type'],
                'confidence': regex_result['confidence'],
                'regex_analysis': regex_result,
                'ast_analysis': ast_result,
                'agreement': None
            }
        
        # No detection
        else:
            return {
                'detected_type': None,
                'confidence': 0,
                'regex_analysis': regex_result,
                'ast_analysis': ast_result,
                'agreement': None
            }
    
    def get_recommended_problem_type(self, starter_code: Dict[str, str], fallback: str = 'function_only_int') -> str:
        """
        Get recommended problem type based on starter code analysis.
        
        Args:
            starter_code: Dictionary mapping language names to starter code
            fallback: Default problem type if analysis fails
            
        Returns:
            Recommended problem type string
        """
        analysis = self.analyze_starter_code(starter_code)
        
        # Return detected type if confidence is high enough
        if analysis['detected_problem_type'] and analysis['confidence'] > 0.6:
            return analysis['detected_problem_type']
        
        return fallback
    
    def validate_problem_type_compatibility(self, starter_code: Dict[str, str], problem_type: str) -> Dict[str, Any]:
        """
        Validate if the given problem type is compatible with the starter code.
        
        Args:
            starter_code: Dictionary mapping language names to starter code
            problem_type: Problem type to validate
            
        Returns:
            Validation results including compatibility status and suggestions
        """
        analysis = self.analyze_starter_code(starter_code)
        
        is_compatible = analysis['detected_problem_type'] == problem_type
        confidence = analysis['confidence']
        
        suggestions = []
        if not is_compatible and analysis['detected_problem_type']:
            suggestions.append(f"Consider using '{analysis['detected_problem_type']}' instead")
        
        if confidence < 0.5:
            suggestions.append("Starter code analysis has low confidence - manual review recommended")
        
        return {
            'is_compatible': is_compatible,
            'confidence': confidence,
            'detected_type': analysis['detected_problem_type'],
            'specified_type': problem_type,
            'suggestions': suggestions,
            'analysis_details': analysis
        }
    
    def get_supported_problem_types(self) -> List[Dict[str, str]]:
        """
        Get list of all supported problem types with descriptions.
        
        Returns:
            List of dictionaries containing problem type information
        """
        return [
            {
                'type': 'function_only_int',
                'name': 'Integer Function',
                'description': 'Functions that take integer parameters and return integer results',
                'example_signature': 'solution(a: int, b: int) -> int',
                'use_cases': ['Mathematical operations', 'Arithmetic problems', 'Number calculations']
            },
            {
                'type': 'function_only_array',
                'name': 'Array Function',
                'description': 'Functions that process arrays/lists of integers',
                'example_signature': 'solution(nums: List[int]) -> int',
                'use_cases': ['Array manipulation', 'Sorting algorithms', 'Search problems']
            },
            {
                'type': 'function_only_string',
                'name': 'String Function',
                'description': 'Functions that process string inputs',
                'example_signature': 'solution(word: str) -> str',
                'use_cases': ['Text processing', 'String manipulation', 'Pattern matching']
            }
        ]
    
    def analyze_and_suggest_improvements(self, starter_code: Dict[str, str]) -> Dict[str, Any]:
        """
        Analyze starter code and suggest improvements for better type detection.
        
        Args:
            starter_code: Dictionary mapping language names to starter code
            
        Returns:
            Analysis results with improvement suggestions
        """
        analysis = self.analyze_starter_code(starter_code)
        suggestions = []
        
        # Check confidence levels
        if analysis['confidence'] < 0.7:
            suggestions.append({
                'type': 'low_confidence',
                'message': 'Consider adding type hints to improve detection accuracy',
                'severity': 'warning'
            })
        
        # Check for missing languages
        expected_languages = {'python', 'java', 'cpp'}
        provided_languages = set(starter_code.keys())
        missing_languages = expected_languages - provided_languages
        
        if missing_languages:
            suggestions.append({
                'type': 'missing_languages',
                'message': f'Missing starter code for: {", ".join(missing_languages)}',
                'severity': 'info',
                'missing': list(missing_languages)
            })
        
        # Check for inconsistent signatures across languages
        detected_types = set()
        for lang_analysis in analysis['language_analysis'].values():
            if lang_analysis.get('detected_type'):
                detected_types.add(lang_analysis['detected_type'])
        
        if len(detected_types) > 1:
            suggestions.append({
                'type': 'inconsistent_signatures',
                'message': 'Function signatures are inconsistent across languages',
                'severity': 'error',
                'detected_types': list(detected_types)
            })
        
        # Check for empty or minimal code
        for lang, code in starter_code.items():
            if not code or len(code.strip()) < 20:
                suggestions.append({
                    'type': 'minimal_code',
                    'message': f'Starter code for {lang} appears too minimal',
                    'severity': 'warning',
                    'language': lang
                })
        
        return {
            **analysis,
            'suggestions': suggestions,
            'overall_quality': self._calculate_quality_score(analysis, suggestions)
        }
    
    def _calculate_quality_score(self, analysis: Dict, suggestions: List[Dict]) -> Dict[str, Any]:
        """
        Calculate a quality score for the starter code analysis.
        """
        base_score = analysis['confidence'] * 100
        
        # Deduct points for issues
        for suggestion in suggestions:
            if suggestion['severity'] == 'error':
                base_score -= 20
            elif suggestion['severity'] == 'warning':
                base_score -= 10
            elif suggestion['severity'] == 'info':
                base_score -= 5
        
        # Bonus for having all languages
        if analysis['total_languages_analyzed'] >= 3:
            base_score += 10
        
        # Ensure score is between 0 and 100
        final_score = max(0, min(100, base_score))
        
        # Determine quality level
        if final_score >= 90:
            quality_level = 'excellent'
        elif final_score >= 75:
            quality_level = 'good'
        elif final_score >= 60:
            quality_level = 'fair'
        else:
            quality_level = 'poor'
        
        return {
            'score': final_score,
            'level': quality_level,
            'description': self._get_quality_description(quality_level)
        }
    
    def _get_quality_description(self, level: str) -> str:
        """Get description for quality level."""
        descriptions = {
            'excellent': 'Starter code has clear, consistent signatures across all languages',
            'good': 'Starter code is well-structured with minor improvements possible',
            'fair': 'Starter code is adequate but could benefit from improvements',
            'poor': 'Starter code needs significant improvements for reliable analysis'
        }
        return descriptions.get(level, 'Unknown quality level')
    
    def get_template_recommendation(self, problem_description: str = "") -> str:
        """
        Recommend a problem type based on problem description keywords.
        
        Args:
            problem_description: Text description of the problem
            
        Returns:
            Recommended problem type
        """
        description_lower = problem_description.lower()
        
        # Array/list keywords
        array_keywords = ['array', 'list', 'elements', 'numbers', 'sequence', 'sort', 'search', 'find', 'maximum', 'minimum']
        if any(keyword in description_lower for keyword in array_keywords):
            return 'function_only_array'
        
        # String keywords
        string_keywords = ['string', 'word', 'text', 'character', 'palindrome', 'substring', 'match', 'replace']
        if any(keyword in description_lower for keyword in string_keywords):
            return 'function_only_string'
        
        # Math/integer keywords
        math_keywords = ['add', 'subtract', 'multiply', 'divide', 'calculate', 'sum', 'difference', 'product']
        if any(keyword in description_lower for keyword in math_keywords):
            return 'function_only_int'
        
        # Default fallback
        return 'function_only_int'





