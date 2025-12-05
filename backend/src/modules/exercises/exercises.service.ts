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
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
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


    const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';
    const internalEndpoint = process.env.S3_ENDPOINT || 'http://minio:9000';

    const uploadUrl = url.replace(internalEndpoint, publicEndpoint);

    return {
      uploadUrl,
      publicUrl: `${publicEndpoint}/${this.bucketName}/${key}`,
    };
  }
}
