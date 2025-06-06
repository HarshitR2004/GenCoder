import boto3
from gencoder import settings
from django.http import JsonResponse


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
            self.s3_client.create_bucket(
                Bucket=self.bucket_name,
            )
            self.ensure_bucket_exists()
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to initialize S3 client", "details": str(e)},
                status=500)
        
        
    def ensure_bucket_exists(self):
        """
        Ensure the S3 bucket exists, creating it if necessary.
        """
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            print(f"Bucket {self.bucket_name} exists.")
        except self.s3_client.exceptions.NoSuchBucket:
            self.s3_client.create_bucket(Bucket=self.bucket_name)
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to ensure bucket exists", "details": str(e)},
                status=500)
        
    def upload_question(self, question_id, question_content):
        """
        Upload the question markdown content as question.md inside
            """
        key = f"questions/question_{question_id}/question.md"
        try:
            self.s3_client.put_object(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Key=key,
                    Body=question_content
            )
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
        except Exception as e:
            return JsonResponse(
                {"error": "Failed to upload output", "details": str(e)},
                status=500)










    
    
