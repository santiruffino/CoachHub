# Deployment Guide

This guide describes how to deploy the Personal Trainer PWA application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Quick Start (MVP)

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd pt_pwa_design
    ```

2.  **Start the application**:
    Run the following command in the root directory:
    ```bash
    docker compose up --build -d
    ```
    This will start:
    - **PostgreSQL** (Database) on port `5433`
    - **MinIO** (Object Storage) on ports `9000` (API) and `9001` (Console)
    - **Backend** (NestJS API) on port `3000`
    - **Frontend** (React/Vite SPA) on port `8080`

3.  **Access the application**:
    - **Frontend**: [http://localhost:8080](http://localhost:8080)
    - **Backend API**: [http://localhost:3000](http://localhost:3000)
    - **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Password: `minioadmin`)

## Environment Variables

The `docker-compose.yml` file comes with pre-configured environment variables for a local production-like setup.

### Backend
| Variable | Description | Default (Docker) |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:password@postgres:5432/pt_pwa?schema=public` |
| `JWT_SECRET` | Secret for signing JWTs | `super-secret-key-change-in-prod` |
| `S3_ENDPOINT` | MinIO/S3 API Endpoint | `http://minio:9000` |
| `S3_PUBLIC_ENDPOINT` | Public URL for accessing files | `http://localhost:9000` |
| `S3_ACCESS_KEY` | S3 Access Key | `minioadmin` |
| `S3_SECRET_KEY` | S3 Secret Key | `minioadmin` |
| `S3_BUCKET_NAME` | Bucket for storing videos | `pt-pwa-videos` |
| `MINIO_BACKEND_USER` | Dedicated username for the backend service. | `backend` |
| `MINIO_BACKEND_PASSWORD` | Password for the backend service user. | `backend-secret` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:8080` |

### Frontend
| Variable | Description | Default (Docker) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## Troubleshooting

-   **Database Connection Error**: Ensure the `postgres` container is healthy. The backend waits for it, but if it takes too long, you might need to restart the backend container: `docker compose restart backend`.
-   **MinIO Buckets Missing**: The `createbuckets` service runs automatically to create the `pt-pwa-videos` bucket. If it fails, check the logs: `docker compose logs createbuckets`.
-   **Frontend 404s**: The Nginx configuration handles SPA routing. Ensure `nginx.conf` is correctly copied to the container.

## Production Deployment Guide (Linux VPS)

This section details how to deploy the application to a Linux Virtual Private Server (e.g., Ubuntu 22.04 on AWS, DigitalOcean, Hetzner).

### 1. Server Provisioning & Security
1.  **Create a VPS**: Launch an instance (Ubuntu 22.04 or Amazon Linux 2023).
2.  **Update System**:
    *   **Amazon Linux**: `sudo yum update -y`
    *   **Ubuntu**: `sudo apt update && sudo apt upgrade -y`
3.  **Create a Non-Root User** (Optional on Amazon Linux, default is `ec2-user`):
    ```bash
    # If using Ubuntu or want a custom user:
    adduser deploy
    usermod -aG sudo deploy
    su - deploy
    ```
4.  **Setup Firewall**:
    *   **AWS Security Groups**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS) in the AWS Console.
    *   **UFW (Ubuntu only)**:
        ```bash
        sudo ufw allow OpenSSH
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw enable
        ```

### 2. Install Docker & Docker Compose

#### Option A: Amazon Linux 2023 / Amazon Linux 2
```bash
# Update installed packages
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo service docker start

# Add the ec2-user to the docker group so you can execute Docker commands without using sudo.
sudo usermod -a -G docker ec2-user

# Log out and log back in again to pick up the new docker group permissions.
# You can also run: newgrp docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Install Docker Compose (Plugin)
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify installation
docker compose version
```

#### Option B: Ubuntu (apt)
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow non-root user to run Docker:
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Deploy the Application
1.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url> app
    cd app
    ```

2.  **Configure Environment**:
    Copy the example env file and edit it with production values.
    ```bash
    cp .env.example .env
    nano .env
    ```
    **CRITICAL CHANGES**:
    -   `POSTGRES_PASSWORD`: Generate a strong random password.
    -   `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -base64 32`).
    -   `MINIO_ROOT_PASSWORD`: Generate a strong password.
    -   `S3_ACCESS_KEY` / `S3_SECRET_KEY`: Change these.
    -   `VITE_API_URL`: Set to your domain (e.g., `https://api.yourdomain.com` or `https://yourdomain.com/api`).
    -   `S3_PUBLIC_ENDPOINT`: Set to your domain (e.g., `https://files.yourdomain.com` or `https://yourdomain.com/files`).

3.  **Start the Stack**:
    ```bash
    docker compose up --build -d
    ```

### 4. Setup SSL/HTTPS (Reverse Proxy)
Do not expose ports 3000, 9000, 5433 directly to the internet. Instead, use a reverse proxy like **Caddy** or **Nginx** on the host to handle SSL and route traffic.

#### Option A: Using Caddy (Easiest)
1.  **Install Caddy**: Follow official instructions.
2.  **Configure Caddyfile** (`/etc/caddy/Caddyfile`):
    ```caddyfile
    yourdomain.com {
        reverse_proxy localhost:8080
    }

    api.yourdomain.com {
        reverse_proxy localhost:3000
    }

    files.yourdomain.com {
        reverse_proxy localhost:9000
    }
    ```
3.  **Restart Caddy**: `sudo systemctl restart caddy`

#### Option B: Using Nginx (Standard)

1.  **Install Nginx**:
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  **Configure Nginx**:
    Create a new configuration file, for example `/etc/nginx/sites-available/pt-pwa`:
    ```bash
    sudo nano /etc/nginx/sites-available/pt-pwa
    ```

    Paste the following configuration (replace `yourdomain.com` with your actual domain):

    ```nginx
    # Frontend (PWA)
    server {
        listen 80;
        server_name app.yourdomain.com;

        location / {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API
    server {
        listen 80;
        server_name backend.yourdomain.com;

        # Increase body size for video uploads
        client_max_body_size 100M;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Forward real IP to backend
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # MinIO (File Storage)
    server {
        listen 80;
        server_name files.yourdomain.com;

        # Increase body size for direct uploads
        client_max_body_size 100M;

        location / {
            proxy_pass http://localhost:9000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Required for MinIO
            proxy_buffering off;
            proxy_request_buffering off;
        }
    }
    ```

3.  **Enable the Configuration**:
    Link the file to `sites-enabled` and remove the default config if necessary.
    ```bash
    sudo ln -s /etc/nginx/sites-available/pt-pwa /etc/nginx/sites-enabled/
    # Optional: remove default
    # sudo rm /etc/nginx/sites-enabled/default
    ```

4.  **Test and Restart**:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

5.  **Setup SSL (HTTPS)**:
    Use Certbot to automatically obtain and configure SSL certificates for all your subdomains.
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d app.yourdomain.com -d backend.yourdomain.com -d files.yourdomain.com
    ```

### 5. Hardware Requirements (AWS EC2)

For this specific stack (Postgres + MinIO + NestJS + Nginx), memory (RAM) is the primary constraint.

#### Option A: All-in-One (Cheapest MVP)
Running everything on a single instance.
-   **Recommended Instance**: **t3.small** (2 vCPU, 2GB RAM)
-   **Why**:
    -   Postgres: ~512MB - 1GB
    -   MinIO: ~256MB - 512MB
    -   Backend (Node.js): ~300MB
    -   OS & Overhead: ~200MB
    -   *Total*: ~1.5GB - 2GB.
    -   *Note*: A `t3.micro` (1GB RAM) will likely crash or swap heavily.

#### Option B: Production (Recommended)
Offload stateful services to managed AWS services.
-   **Database**: AWS RDS (PostgreSQL)
-   **Storage**: AWS S3 (Instead of MinIO)
-   **App Instance**: **t3.micro** or **t3.small**
-   **Why**: Removing Postgres and MinIO frees up significant resources. The app itself is lightweight.

#### Storage
-   **Root Volume**: 20GB gp3 (General Purpose SSD) is sufficient for the OS and Docker images.
-   **Data**: If using Option A, ensure you monitor disk usage as video uploads (MinIO) will consume space quickly. Consider mounting a separate EBS volume for `/var/lib/docker/volumes`.

### 6. Database Access (DBeaver)

To manage the database, use a client like **DBeaver**.

#### Connection Details
-   **Host**: `localhost` (if using SSH Tunnel) or Your EC2 Public IP
-   **Port**: `5433` (External port defined in `docker-compose.yml`)
-   **Database**: `pt_pwa` (or value of `POSTGRES_DB`)
-   **Username**: Value of `POSTGRES_USER` in `.env`
-   **Password**: Value of `POSTGRES_PASSWORD` in `.env`

#### Security Considerations (CRITICAL)

**Option A: SSH Tunneling (Recommended)**
This is the most secure method. You do **not** need to open port 5433 to the internet.
1.  In DBeaver, create a new PostgreSQL connection.
2.  **Main** tab:
    -   Host: `localhost`
    -   Port: `5433`
3.  **SSH** tab:
    -   Check "Use SSH Tunnel".
    -   **Host/IP**: Your EC2 Public IP.
    -   **User**: `ubuntu` (or `ec2-user` for Amazon Linux).
    -   **Authentication Method**: Public Key.
    -   **Private Key**: Path to your `.pem` key file on your computer.
4.  Click "Test Connection".

**Option B: Direct Connection (Less Secure)**
If you must connect directly:
1.  Go to AWS Console > EC2 > Security Groups.
2.  Edit Inbound Rules.
3.  Add Rule:
    -   Type: Custom TCP
    -   Port: `5433`
    -   Source: **My IP** (Do NOT use `0.0.0.0/0` - this exposes your DB to the entire world).

### 7. Database Seeding (Initial Admin User)

The database is empty by default. You need to run the seed script to create the initial Super Admin user.

1.  **Run the seed command** inside the backend container:
    ```bash
    docker compose exec backend npx prisma db seed
    ```

2.  **Verify the user**:
    The default admin user will be created with:
    -   **Email**: `admin@example.com`
    -   **Password**: `admin123`

    > [!IMPORTANT]
    > **Change this password immediately** after logging in for the first time!

