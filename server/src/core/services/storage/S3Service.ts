import AWS from 'aws-sdk';
import { Readable } from 'stream';
import config from '../../../config';

export class S3Service {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
    this.bucket = config.aws.bucketName;
  }

  async uploadFile(
    fileStream: Readable,
    fileName: string,
    mimeType: string,
    folder: string = 'uploads'
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName}`;

    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
      ContentType: mimeType,
    };

    try {
      await this.s3.upload(uploadParams).promise();
      return `https://${this.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.com/')[1];
    
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 