import boto3
from gencoder import settings
from django.http import JsonResponse
from rest_framework.response import Response

class S3Service:
    """
    A service class to handle S3 operations.
    """
    def __init__(self):
        
        try:
            # Initialize the S3 client
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL
            )
            self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        except Exception as e:
            raise Exception(f"Failed to initialize S3 client: {str(e)}")
      
    def upload_question(self, question_id, question_content):
        """
        Upload the question markdown content as question.md inside
            """
        key = f"questions/question_{question_id}/question.md"
        try:
            self.s3_client.put_object(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Key=key,
                    Body=question_content,
                    ContentType='text/markdown'
            )
            return key
        except Exception as e:
            return JsonResponse(    
                {"error": "Failed to upload question", "details": str(e)},
                status=500)
            
    def get_question(self, question_id):
        """
        Retrieve the question markdown content from S3.
        """    
        key = f"questions/question_{question_id}/question.md"
        try:
            response = self.s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key
            )
            return response['Body'].read().decode('utf-8')
        except self.s3_client.exceptions.NoSuchKey:
                return JsonResponse(
                    {"error": "Question not found"},
                    status=404)
        

    def upload_input(self, question_id, case_id, input_data):
        """
        Upload input.txt inside
        """
        key = f"questions/question_{question_id}/testcases/case_{case_id}/input.txt"
        try:
            self.s3_client.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key,
                Body=input_data
            )
            return key
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to upload input", "details": str(e)},
                status=500)

    def upload_output(self, question_id, case_id, output_data):
        """
        Upload output.txt inside
        """
        key = f"questions/question_{question_id}/testcases/case_{case_id}/output.txt"
        try:
            self.s3_client.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key,
                Body=output_data
            )
            return key
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to upload output", "details": str(e)},
                status=500)
            
    def upload_starter_code(self, question_id, language, code_content):
            """
        Upload starter code for a specific question and language.
            """
            key = f"questions/question_{question_id}/starter_code/{language}.txt"
            try:
                self.s3_client.put_object(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Key=key,
                    Body=code_content,
                    ContentType='text/plain'
                )
                return key
            except Exception as e:
                return Response(
                    {"error": "Failed to upload starter code", "details": str(e)},
                    status=500)

    def get_starter_code(self, question_id, language):
        """
        Retrieve the starter code for a specific question and language.
        """
        key = f"questions/question_{question_id}/starter_code/{language}.txt"
        try:
            response = self.s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key
            )
            return response['Body'].read().decode('utf-8')
        except self.s3_client.exceptions.NoSuchKey:
            return JsonResponse(
                {"error": "Starter code not found"},
                status=404)

    def get_input_and_output(self, question_id, case_id):
        """
        Retrieve input and output for a specific test case.
        """
        input_key = f"questions/question_{question_id}/testcases/case_{case_id}/input.txt"
        output_key = f"questions/question_{question_id}/testcases/case_{case_id}/output.txt"
        
        try:
            input_response = self.s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=input_key
            )
            output_response = self.s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=output_key
            )
            return {
                "input": input_response['Body'].read().decode('utf-8'),
                "output": output_response['Body'].read().decode('utf-8')
            }
        except self.s3_client.exceptions.NoSuchKey:
            return JsonResponse(
                {"error": "Input or output not found"},
                status=404)







