# Backend Setup Guide

## Prerequisites
- Node.js (v22.12+ recommended, or use v22.1.0 with Prisma 5)
- Docker & Docker Compose

## 1. Install Dependencies
```bash
cd backend
npm install
```

## 2. Start Database
Start the PostgreSQL database using Docker:
```bash
docker-compose up -d
```
This will start Postgres on port `5432` with user `user`, password `password`, and db `pt_pwa`.

## 3. Database Migration
Apply the Prisma schema to the database:
```bash
npx prisma migrate dev --name init
```
This will create the tables in the database.

## 4. Start Development Server
```bash
npm run start:dev
```
The API will be available at `http://localhost:3000`.

## 6. Run with Docker (Full Stack)
To run both the database and the backend in Docker containers:

```bash
docker-compose up --build
```

- The backend will be available at `http://localhost:3000`.
- The database will be accessible on port `5433` (mapped to avoid conflicts).
- Migrations are automatically applied on startup.

## 7. MinIO (Object Storage)
The project uses MinIO as an S3-compatible object storage for video uploads.

### Access
- **Console**: `http://localhost:9001`
- **API**: `http://localhost:9000`
- **User**: `minioadmin`
- **Password**: `minioadmin`

### Persistence
Data is persisted in the `minio_data` Docker volume. This ensures that uploaded files are retained even if the container is restarted or removed.

### Bucket Initialization (`createbuckets`)
A helper container `createbuckets` runs on startup to:
1.  Configure the MinIO alias.
2.  Create the `pt-pwa-videos` bucket (if it doesn't exist).
3.  Set the bucket policy to `public`.

**Note**: This container is designed to **exit with code 0** after completing its task. It is normal for it to show as "Exited" in Docker.

If you need to re-run the initialization (e.g., if you manually deleted the bucket):
```bash
docker-compose up -d createbuckets
```

