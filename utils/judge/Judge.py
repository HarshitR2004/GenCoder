import requests

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

     



