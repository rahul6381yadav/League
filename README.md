
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