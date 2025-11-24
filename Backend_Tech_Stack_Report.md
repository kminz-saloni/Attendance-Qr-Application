# Backend Technology Stack Report

## 1. Core Framework: Django (v5.2.8)
**Role**: The backbone of the backend, handling the server, database ORM, and core logic.

### Implementation Details
*   **Custom User Model**: Uses a custom user model (`User`) in `users/models.py` extending `AbstractUser`. This adds a `role` field (Student/Faculty/Admin) and a unique `user_id` while retaining Django's built-in auth features.
*   **ORM Relationships**: Complex relationships defined in `users/models.py`:
    *   **One-to-One**: Between `User` and `Student`/`Faculty` profiles.
    *   **Many-to-Many**: `Student` to `Subject` (enforcing exactly 7 subjects via custom validation).
    *   **Foreign Keys**: Linking `Attendance` to `Student` and `Session`.
*   **Business Logic**:
    *   **Hashing**: Uses the standard `hashlib` library in `users/models.py` to generate a `subjects_hash`. This creates a unique signature for a specific combination of 7 subjects, automatically assigning students to the correct `ClassGroup`.

## 2. API Framework: Django REST Framework (DRF) (v3.15.2)
**Role**: Converts Django models into a JSON API for the React frontend.

### Implementation Details
*   **Serializers (`users/serializers.py`)**: Uses `ModelSerializer` to transform model instances to JSON.
    *   **Custom Validation**: Robust validation logic implemented.
        *   `StudentSerializer`: Ensures a student selects exactly 7 subjects and that all subjects belong to their year.
        *   `AttendanceSerializer`: Checks if a student is enrolled in the subject before marking attendance.
*   **Views (`users/views.py`)**:
    *   **Generic Views**: Extensive use of DRF's generic views (`ListCreateAPIView`, `RetrieveAPIView`) for standard CRUD operations (e.g., `SessionListView`, `FacultyListView`).
    *   **APIView**: Used for custom logic like `AttendanceStatsView` to calculate attendance percentages manually.
*   **Permissions**: Uses `IsAuthenticated` globally to ensure data security. Custom role checks (e.g., `if request.user.role != 'faculty'`) are implemented directly inside view methods.

## 3. Authentication: Simple JWT (v5.4.0)
**Role**: Handles secure, stateless login using JSON Web Tokens.

### Implementation Details
*   **Custom Login View**: `CustomTokenObtainPairView` in `users/views.py` extends the default JWT login view. It injects extra data into the login response—specifically the user's `role` and `user_id`—allowing the frontend to direct users to the correct dashboard (Student vs. Faculty).
*   **Settings**: Configured in `settings.py` as the default authentication class, ensuring every API request is checked for a valid "Bearer" token.

## 4. QR Code Generation: `qrcode` (v8.0) & `Pillow` (v11.0.0)
**Role**: Generates dynamic QR codes for attendance sessions.

### Implementation Details
*   **Dynamic Generation**: `GenerateQRView` in `users/views.py` creates a unique string containing the `session_id` and a `timestamp`.
*   **Image Creation**: The `qrcode` library creates the QR object, and `Pillow` draws the image.
*   **Base64 Encoding**: The image is saved to an in-memory buffer (`io.BytesIO`) and converted to a **Base64 string**. This string is sent in the JSON response, allowing the React app to display the QR code immediately without a separate image download.

## 5. Database Driver: `psycopg2-binary` (v2.9.10)
**Role**: The adapter enabling Django to communicate with the PostgreSQL database.

### Implementation Details
*   Used implicitly by Django's ORM. It is not imported directly in views or models but is utilized behind the scenes for all database operations (`.save()`, `.get()`, `.filter()`).

## 6. CORS: `django-cors-headers` (v4.6.0)
**Role**: Security middleware allowing the React frontend to communicate with the Django backend.

### Implementation Details
*   Added to `MIDDLEWARE` in `settings.py`.
*   Configured to allow requests from the frontend origin (e.g., `localhost:3000`), preventing "Cross-Origin Request Blocked" errors in the browser.
