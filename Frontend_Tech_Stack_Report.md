# Frontend Technology Stack Report

## 1. Core Framework: React (v19.2.0) & TypeScript
**Role**: The foundation of the Single Page Application (SPA).

### Implementation Details
*   **Hooks**: Extensive use of React Hooks:
    *   `useState`: For local component state (e.g., managing scanner status, form inputs).
    *   `useEffect`: For side effects like fetching data on mount or initializing the QR scanner.
    *   `useContext`: Used in `AuthContext.tsx` to provide global access to user authentication state.
    *   `useRef`: Used in `QRScannerStudent.tsx` to maintain a reference to the scanner instance without triggering re-renders.
*   **TypeScript**: Provides static typing for API responses and component props.
    *   **Interfaces**: Defined for domain objects like `User`, `Session`, and `AttendanceRecord` to ensure type safety throughout the application.

## 2. Styling: Tailwind CSS (v3.4.18)
**Role**: Utility-first CSS framework for rapid and consistent UI development.

### Implementation Details
*   **Configuration**: Configured in `tailwind.config.js` to scan all source files.
*   **Usage**: Applied directly in JSX via `className`.
    *   **Responsive Design**: Uses breakpoints (e.g., `grid-cols-1 lg:grid-cols-2`) to create mobile-friendly layouts.
    *   **Animations**: Uses built-in utility classes like `animate-spin` (loading spinners) and `animate-bounce` (success messages).
    *   **Layouts**: Flexbox and Grid are used extensively for page structure (e.g., `flex items-center justify-between`).

## 3. Routing: React Router DOM (v7.9.6)
**Role**: Handles client-side navigation and route protection.

### Implementation Details
*   **Setup**: `BrowserRouter` wraps the application in `App.tsx`.
*   **Route Protection**: A custom `ProtectedRoute` component checks the `isAuthenticated` state from `AuthContext`. If a user is not logged in, they are redirected to `/login`.
*   **Role-Based Routing**: Different routes are defined for different user roles:
    *   `/student/*`: For student-specific features (Dashboard, Scan, History).
    *   `/faculty/*`: For faculty features (Dashboard, Session Management).
    *   `/admin/*`: For administrative tasks.

## 4. State Management & Authentication: Context API
**Role**: Manages global application state, primarily user authentication.

### Implementation Details
*   **AuthContext (`contexts/AuthContext.tsx`)**:
    *   **State**: Manages `user` object and JWT `token`.
    *   **Persistence**: Uses `localStorage` to save the `access_token` and `user` data, allowing the session to persist across page reloads.
    *   **Global Headers**: Automatically sets the `Authorization: Bearer <token>` header for Axios whenever a user logs in or the app loads with a valid token.

## 5. API Communication: Axios (v1.13.2)
**Role**: Promise-based HTTP client for communicating with the Django backend.

### Implementation Details
*   **Configuration**:
    *   **Base URL**: Currently hardcoded to `http://127.0.0.1:8000/api/` (Development setup).
    *   **Headers**: `Content-Type: application/json` is used for data transmission.
*   **Usage**:
    *   `axios.post()`: Used for Login, Registration, and Marking Attendance.
    *   `axios.get()`: Used for fetching Dashboards, Sessions, and Profiles.
    *   **Error Handling**: `try/catch` blocks are used to handle API errors, with specific logic to handle `401 Unauthorized` errors (redirecting to login).

## 6. QR Code Technology
**Role**: The core feature for the attendance system.

### Scanning (Student Side)
*   **Library**: `html5-qrcode` (v2.3.8)
*   **Implementation**:
    *   Located in `components/student/QRScannerStudent.tsx`.
    *   Uses `Html5QrcodeScanner` to access the device camera directly in the browser.
    *   **Permissions**: Explicitly requests camera permissions (`navigator.mediaDevices.getUserMedia`) before initializing the scanner.
    *   **Logic**: Scans a QR code, extracts the `session_id`, and immediately sends a POST request to the backend to mark attendance.

### Generation (Faculty Side)
*   **Library**: `qrcode` (v1.5.4)
*   **Implementation**:
    *   Located in `components/faculty/ClassSession.tsx`.
    *   **Data Flow**: The backend generates a unique *string* (e.g., `session_id-timestamp`) and sends it to the frontend.
    *   **Rendering**: The frontend uses `QRCode.toDataURL()` to convert this string into a visual QR code image (Data URL) which is then displayed via an `<img>` tag.
    *   **Security**: The component automatically refreshes the QR code every 30 seconds (via `setInterval`) to prevent attendance fraud.
