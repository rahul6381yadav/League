
## Backend Setup

### Prerequisites
- Node.js
- MongoDB

### Installation
1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env] file in the [backend] directory and add the following environment variables:
    ```env
    PORT=4000
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-email-password
    JWT_SECRET=your-jwt-secret
    ```

4. Start the server:
    ```sh
    npm start
    ```

## API Endpoints

# User Management Endpoints

## User Signup
- **URL:** `/api/v1/auth/signup`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
        "fullName": "Full Name",
        "studentId": "Student ID",
        "email": "email@example.com",
        "password": "password123",
        "batchCode": "Batch Code",
        "photo": "Photo URL",
        "roles": ["Role"]
    }
    ```
- **Responses:**
    - **201 Created:** User signed up successfully.
    - **400 Bad Request:** User already exists.
    - **500 Internal Server Error:** Internal Server Error.

## User Login
- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
        "email": "email@example.com",
        "password": "password123"
    }
    ```
- **Responses:**
    - **200 OK:** Login successful, token returned.
    - **400 Bad Request:** Invalid credentials.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.

## Forgot Password (Request OTP)
- **URL:** `/api/v1/auth/forgot-password`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
        "email": "email@example.com"
    }
    ```
- **Responses:**
    - **200 OK:** OTP sent to user's email.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.

## Verify OTP
- **URL:** `/api/v1/auth/verify-otp`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
        "email": "email@example.com",
        "otp": "123456"
    }
    ```
- **Responses:**
    - **200 OK:** OTP verified. Password reset can proceed.
    - **400 Bad Request:** Invalid OTP or OTP expired.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.

## Reset Password
- **URL:** `/api/v1/auth/reset-password`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
        "email": "email@example.com",
        "newPassword": "newpassword123"
    }
    ```
- **Responses:**
    - **200 OK:** Password reset successfully.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.

### User Management Endpoints-2

#### Create a New User (Admin/Coordinator Only)
- **URL:** `/api/v1/user`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
    ```json
    {
        "fullName": "Full Name",
        "studentId": "Student ID",
        "email": "email@example.com",
        "password": "password123",
        "batchCode": "Batch Code",
        "photo": "Photo URL",
        "roles": ["Role"]
    }
    ```
- **Responses:**
    - **201 Created:** User created successfully.
    - **400 Bad Request:** User already exists or invalid input.
    - **403 Forbidden:** Insufficient permissions.
    - **500 Internal Server Error:** Internal Server Error.

#### Update User by ID
- **URL:** `/api/v1/user`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id` (User ID)
- **Request Body:** (Include only fields to update.)
    ```json
    {
        "fullName": "Updated Name",
        "batchCode": "Updated Batch Code"
    }
    ```
- **Responses:**
    - **200 OK:** User updated successfully.
    - **403 Forbidden:** Insufficient permissions.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Delete User by ID
- **URL:** `/api/v1/user`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id` (User ID)
- **Responses:**
    - **200 OK:** User deleted successfully.
    - **403 Forbidden:** Insufficient permissions.
    - **404 Not Found:** User not found.
    - **500 Internal Server Error:** Internal Server Error.


### Club Endpoints

#### Create a New Club
- **URL:** `/api/v1/club`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Permitted Users** `CoSA & Faculty`
- **Request Body:**
    ```json
    {
        "name": "Club Name",
        "description": "Club Description",
        "members": ["memberId1_Object_Id (Created by mongodb)"],
        "studentMembers": ["studentMemberId1_object_id"]
    }
    ```
- **Responses:**
    - **201 Created:** Club created successfully
    - **400 Bad Request:** Club with the given name already exists
    - **500 Internal Server Error:** Internal Server Error

#### Fetching One Club in Detail + All Member Details
- **URL:** `/api/v1/club`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id`
- **Responses:**
    - **200 OK:** Clubs or club fetched successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

#### Search Clubs + All Clubs, Don't use search query
- **URL:** `/api/v1/club`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `search`
- **Responses:**
    - **200 OK:** Clubs or club fetched successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

#### Filter Clubs
- **URL:** `/api/v1/club`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `ratingMin, ratingMax, limit, skip`
- **Responses:**
    - **200 OK:** Clubs or club fetched successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

#### Clubs by id of user in which they are coordinating
- **URL:** `/api/v1/club`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `coordinatorId, limit, skip`
- **Responses:**
    - **200 OK:** Clubs or club fetched successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

#### Update a Club by ID
- **URL:** `/api/v1/club`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** [id]
- **Request Body:**
    ```json
    {
        "name": "Updated Club Name (Every Parameter is Optional)",
        "description": "Updated Club Description",
        "members": ["updatedMemberId1", "updatedMemberId2"],
        "studentMembers": ["updatedStudentMemberId1", "updatedStudentMemberId2"]
    }
    ```
- **Responses:**
    - **200 OK:** Club updated successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

#### Delete a Club by ID
- **URL:** `/api/v1/club`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** [id]
- **Responses:**
    - **200 OK:** Club deleted successfully
    - **404 Not Found:** Club not found
    - **500 Internal Server Error:** Internal Server Error

### Event Endpoints

#### Create a New Event
- **URL:** `/api/v1/event`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Permitted Users:** Club Coordinators & Faculty
- **Request Body:**
    ```json
    {
        "clubId": "ClubID_ObjectId",
        "eventName": "Event Name",
        "description": "Event Description",
        "vanue": "Event Venue",
        "duration": "2 hours",
        "maxPoints": 100,
        "date": "YYYY-MM-DD"
    }
    ```
- **Responses:**
    - **201 Created:** Event created successfully.
    - **400 Bad Request:** Invalid data in request body.
    - **500 Internal Server Error:** Internal Server Error.

#### Fetch One Event in Detail
- **URL:** `/api/v1/event`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id` (Event ID)
- **Responses:**
    - **200 OK:** Event fetched successfully.
    - **404 Not Found:** Event not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Search Events or Fetch All Events
- **URL:** `/api/v1/event`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
    - `search` (Search by event name, case-insensitive)
    - `clubId` (Filter events by Club ID)
    - `limit` (Optional: Number of events to return)
    - `skip` (Optional: Number of events to skip)
- **Responses:**
    - **200 OK:** Events fetched successfully.
    - **404 Not Found:** Events not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Filter Events
- **URL:** `/api/v1/event`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
    - `dateMin` (Filter events starting from this date)
    - `dateMax` (Filter events up to this date)
    - `limit` (Optional: Number of events to return)
    - `skip` (Optional: Number of events to skip)
- **Responses:**
    - **200 OK:** Events fetched successfully.
    - **404 Not Found:** Events not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Fetch Events Coordinated by a Specific User
- **URL:** `/api/v1/event`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
    - `coordinatorId` (User ID of the coordinator)
    - `limit` (Optional: Number of events to return)
    - `skip` (Optional: Number of events to skip)
- **Responses:**
    - **200 OK:** Events fetched successfully.
    - **404 Not Found:** Events not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Update an Event by ID
- **URL:** `/api/v1/event`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id` (Event ID)
- **Request Body:** (Only include the fields you want to update.)
    ```json
    {
        "eventName": "Updated Event Name",
        "description": "Updated Event Description",
        "vanue": "Updated Event Venue",
        "duration": "3 hours",
        "maxPoints": 120,
        "date": "YYYY-MM-DD"
    }
    ```
- **Responses:**
    - **200 OK:** Event updated successfully.
    - **404 Not Found:** Event not found.
    - **500 Internal Server Error:** Internal Server Error.

#### Delete an Event by ID
- **URL:** `/api/v1/event`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `id` (Event ID)
- **Responses:**
    - **200 OK:** Event deleted successfully.
    - **404 Not Found:** Event not found.
    - **500 Internal Server Error:** Internal Server Error.



## Frontend Setup

### Installation
1. Navigate to the [frontend] directory:
    ```sh
    cd frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm start
    ```

## License
This project is licensed under the MIT License.