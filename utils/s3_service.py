# utils/s3_service.py
import boto3
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from django.conf import settings
from typing import Optional, Tuple
import io

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        """Initialize S3 client with configuration from settings"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=settings.AWS_S3_ENDPOINT_URL 
            )
            self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
            self._ensure_bucket_exists()
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            raise

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                try:
                    if settings.AWS_S3_REGION_NAME == 'us-east-1':
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={'LocationConstraint': settings.AWS_S3_REGION_NAME}
                        )
                    logger.info(f"Created bucket: {self.bucket_name}")
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket: {create_error}")
                    raise

    def upload_file(self, file_content: str, s3_key: str, content_type: str = 'text/plain') -> bool:
        """Upload file content to S3"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content.encode('utf-8'),
                ContentType=content_type
            )
            logger.info(f"Successfully uploaded {s3_key} to S3")
            return True
        except ClientError as e:
            logger.error(f"Failed to upload {s3_key} to S3: {e}")
            return False

    def download_file(self, s3_key: str) -> Optional[str]:
        """Download file content from S3"""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=s3_key)
            content = response['Body'].read().decode('utf-8')
            logger.info(f"Successfully downloaded {s3_key} from S3")
            return content
        except ClientError as e:
            logger.error(f"Failed to download {s3_key} from S3: {e}")
            return None

    def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info(f"Successfully deleted {s3_key} from S3")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete {s3_key} from S3: {e}")
            return False

    def generate_presigned_url(self, s3_key: str, expiration: int = None) -> Optional[str]:
        """Generate presigned URL for file access"""
        try:
            expiration = expiration or settings.SIGNED_URL_EXPIRATION
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL for {s3_key}: {e}")
            return None

    def list_objects(self, prefix: str) -> list:
        """List objects with given prefix"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            return response.get('Contents', [])
        except ClientError as e:
            logger.error(f"Failed to list objects with prefix {prefix}: {e}")
            return []

