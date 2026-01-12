# 📘 Personal Expense Tracker - Technical Documentation

## 1. Environment Setup

### Prerequisites
*   **Node.js**: v18 or higher
*   **MongoDB**: Local installation or MongoDB Atlas (Cloud)
*   **Git**: Version control

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Paras-Chhabra/ExpenseTracker1.git
    cd ExpenseTracker1
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5001
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker
    JWT_SECRET=your_secure_random_string
    NODE_ENV=development
    ```

3.  **Install Dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

4.  **Run Locally:**
    ```bash
    # Terminal 1: Start Backend
    cd server
    npm run dev

    # Terminal 2: Start Frontend
    cd client
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

---

## 2. Database Schema

The application uses **MongoDB** with Mongoose ODM.

### User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier |
| `name` | String | User's full name |
| `email` | String | Unique email address (indexed) |
| `password` | String | Hashed password (bcrypt) |
| `createdAt` | Date | Timestamp of registration |

### Transaction Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier |
| `user` | ObjectId | Reference to User model |
| `amount` | Number | Transaction amount |
| `type` | String | 'income' or 'expense' |
| `category` | String | e.g., 'Food', 'Rent', 'Salary' |
| `description` | String | Optional details |
| `date` | Date | Transaction date (Default: Date.now) |

---

## 3. API Usage & Endpoints

Base URL: `http://localhost:5001/api`

### Authentication
*   **POST** `/auth/register`
    *   Body: `{ "name": "John", "email": "john@example.com", "password": "123" }`
    *   Response: Returns JWT Token.
*   **POST** `/auth/login`
    *   Body: `{ "email": "john@example.com", "password": "123" }`
    *   Response: Returns JWT Token.

### Transactions (Requires Auth Token)
*   **GET** `/transactions`
    *   Query Params: `?page=1&limit=10&startDate=2024-01-01`
    *   Returns list of transactions.
*   **POST** `/transactions`
    *   Body: `{ "amount": 500, "type": "expense", "category": "Food", "date": "2024-01-12" }`
*   **PUT** `/transactions/:id`
    *   Update an existing transaction.
*   **DELETE** `/transactions/:id`
    *   Remove a transaction.

### Analytics
*   **GET** `/analytics/summary`
    *   Returns total Income, Expenses, Balance, and Category Breakdown.
*   **GET** `/analytics/insights`
    *   Returns Daily Spending Trends, Anomalies, and Highest Expense alerts.

---

## 4. Deployment

### Backend (Render.com)
1.  Create a **Web Service** connected to the GitHub repo.
2.  **Root Directory**: `server`
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   `MONGODB_URI`: Your Production Connection String.
    *   `JWT_SECRET`: Secure Secret.
    *   `NODE_ENV`: `production`

### Frontend (Vercel)
1.  Import project from GitHub.
2.  **Root Directory**: `client`
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Your Render Backend URL + `/api` (e.g., `https://api.onrender.com/api`).
4.  Deploy!
