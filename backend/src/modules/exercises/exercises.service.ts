import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Role } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ExercisesService {
  private s3Client: S3Client;
  private bucketName = 'pt-pwa-videos';

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: 'us-east-1', // MinIO requires a region, though it doesn't matter which
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true, // Required for MinIO
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
      },
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
    // Fetch global exercises (no coachId) and exercises created by this coach
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
    const key = `${Date.now()} -${fileName} `;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    // Return the upload URL and the final public URL
    return {
      uploadUrl: url,
      publicUrl: `${process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000'}/${this.bucketName}/${key}`,
    };
  }
}
