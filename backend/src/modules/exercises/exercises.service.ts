import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Role } from '@prisma/client';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ExercisesService {
  private s3Client: S3Client;
  private publicS3Client: S3Client;
  private bucketName = 'pt-pwa-videos';

  constructor(private prisma: PrismaService) {
    const credentials = {
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    };

    // Internal client for backend operations (upload/delete)
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true,
      credentials,
    });

    // Public client for signing URLs (browser uploads)
    this.publicS3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true,
      credentials,
    });
  }

  async create(userId: string, createExerciseDto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: {
        ...createExerciseDto,
        coachId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { coachId: null },
          { coachId: userId },
        ],
      },
      orderBy: { title: 'asc' },
    });
  }

  async getPresignedUrl(fileName: string, fileType: string) {
    const key = `${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    // Use the public client to sign the URL
    // This ensures the signature matches the public endpoint the browser uses
    const uploadUrl = await getSignedUrl(this.publicS3Client, command, { expiresIn: 3600 });

    return {
      uploadUrl,
      publicUrl: `${process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000'}/${this.bucketName}/${key}`,
    };
  }

  async remove(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });

    if (exercise && exercise.videoUrl) {
      try {
        // Extract key from URL
        // URL format: http://domain/bucket/key
        const urlParts = exercise.videoUrl.split(`${this.bucketName}/`);
        if (urlParts.length > 1) {
          const key = urlParts[1];
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }));
        }
      } catch (error) {
        console.error('Error deleting file from S3:', error);
        // Continue to delete the record even if S3 deletion fails
      }
    }

    return this.prisma.exercise.delete({
      where: { id },
    });
  }
}
