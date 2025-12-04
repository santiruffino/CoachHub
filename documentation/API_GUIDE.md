# Backend API Guide

## Getting Started

### 1. Seed the Database
To create the initial Admin user, make sure you are in the `backend` directory and run:
```bash
cd backend
npx prisma db seed
```
This creates:
- **Email**: `admin@example.com`
- **Password**: `admin123`

### 2. User Management Strategy
The platform enforces a strict hierarchy for user creation:

| Role | Creation Method | Endpoint/Tool | Notes |
| :--- | :--- | :--- | :--- |
| **ADMIN** | **Seed Script** | `npx prisma db seed` | Cannot be created via API for security. |
| **COACH** | **Admin API** | `POST /admin/coaches` | Only Admins can onboard new Coaches. |
| **STUDENT** | **Public Registration** | `POST /auth/register` | Students sign up themselves. Default role is `STUDENT`. |

### 3. Authentication Flow
All Admin endpoints require a Bearer Token.

#### Login
**Request:**
`POST /auth/login`
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### 3. Using the Token
Add the token to the `Authorization` header in subsequent requests:
```
Authorization: Bearer <access_token>
```

## Admin Endpoints

### Manage Coaches

#### Create a Coach
`POST /admin/coaches`
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
    "email": "coach@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

#### List Coaches
`GET /admin/coaches`
- **Auth**: Required (Admin)
- **Response**: List of coaches with stats (student count, plan count).

#### Get Coach Stats
`GET /admin/coaches/:id/stats`
- **Auth**: Required (Admin)
- **Response**:
  ```json
  {
    "studentCount": 5,
    "planCount": 2
  }
  ```

#### Delete Coach
`DELETE /admin/coaches/:id`
- **Auth**: Required (Admin)
- **Effect**: Soft deletes the coach (sets `isActive: false`).

## Coach Endpoints

### Manage Students

#### Create a Student
`POST /users/student`
- **Auth**: Required (Coach)
- **Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "tempPassword123",
    "name": "New Student"
  }
  ```
- **Note**: The student is automatically assigned to the creating Coach.

#### List Students
`GET /users/students`
- **Auth**: Required (Coach)
- **Response**: List of students assigned to the logged-in Coach.

## Tools
We recommend using **Postman** or **Curl** to test these endpoints.

### Postman Collection
We have included a Postman collection to make testing easier.
1.  Open Postman.
2.  Click **Import**.
3.  Select `documentation/postman_collection.json`.
4.  The collection "PT PWA Backend" will appear.
5.  **Tip**: The "Login" request automatically saves the access token to the collection variables, so you don't need to copy-paste it for other requests!
