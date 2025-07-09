import boto3
from gencoder import settings

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
            )
            self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        except Exception as e:
            raise Exception(f"Failed to initialize S3 client: {str(e)}")
        
      
    def upload_question(self, question_id, question_content):
        """Upload the question markdown content as question.md"""
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
            raise Exception(f"Failed to upload question: {str(e)}")

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
            raise Exception("Question not found")

    def upload_input(self, question_id, case_id, input_data):
        """Upload input.txt"""
        key = f"questions/question_{question_id}/testcases/case_{case_id}/input.txt"
        try:
            self.s3_client.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key,
                Body=input_data
            )
            return key
        except Exception as e:
            raise Exception(f"Failed to upload input: {str(e)}")

    def upload_output(self, question_id, case_id, output_data):
        """Upload output.txt"""
        key = f"questions/question_{question_id}/testcases/case_{case_id}/output.txt"
        try:
            self.s3_client.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key,
                Body=output_data
            )
            return key
        except Exception as e:
            raise Exception(f"Failed to upload output: {str(e)}")
            
    def upload_starter_code(self, question_id, language, code_content):
        """Upload starter code for a specific question and language."""
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
            raise Exception(f"Failed to upload starter code: {str(e)}")

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
            raise Exception("Starter code not found")

    def get_input_and_output(self, question_id, case_id):
        """
        Retrieve input and output for a specific test case.
        """
        input_key = f"questions/question_{question_id}/testcases/case_case_{case_id}/input.txt"
        output_key = f"questions/question_{question_id}/testcases/case_case_{case_id}/output.txt"
                
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
                  
        except Exception as e:
            raise Exception(f"Failed to retrieve input/output: {str(e)}")

    def delete_question(self, question_id):
        """Delete all files related to a specific question."""
        prefix = f"questions/question_{question_id}/"
        print(f"Deleting all objects with prefix: {prefix}")

        try:
            response = self.s3_client.list_objects_v2(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Prefix=prefix
            )

            if 'Contents' in response:
                objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]

                delete_response = self.s3_client.delete_objects(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Delete={'Objects': objects_to_delete}
                )
                
                return {"message": f"Successfully deleted {len(objects_to_delete)} objects"}
            else:
                raise Exception("No objects found to delete")
        except self.s3_client.exceptions.NoSuchBucket:
            raise Exception("Bucket does not exist")

        except Exception as e:
            raise Exception(f"Failed to delete question from S3: {str(e)}")



    
