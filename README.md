# WalletWise - Personal Finance & Expense Management Web Application

WalletWise is a production-ready, full-stack personal finance and expense management platform built for hackathons. It helps users log incomes/expenses, set budgets, track long-term savings goals, transfer funds atomically, and visualize spending metrics via interactive dashboards.

---

## Technical Stack

- **Frontend**: React.js (Vite), React Router v6, Tailwind CSS, Recharts, React Hook Form, Axios, React Hot Toast, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Mongoose.
- **Database**: MongoDB.
- **Orchestration**: Docker, Docker Compose.

---

## Features

1. **Authentication**: JWT-based secure signup, login, persistent session (localStorage), and password recovery simulation.
2. **Accounts & Wallets**: Manage separate accounts (Checking, Savings, Cash, Credit Card) with dynamic balances.
3. **Atomic Transfers**: Execute secure, real-time money transfers between accounts with automatic balance increments/decrements and double-spend/overdraft checks.
4. **Income Tracker**: Record salary, freelance, or dividend income.
5. **Expense Tracker**: Monitor lifestyle expenses by categories (Food, Bills, Education, Shopping, Transport, etc.).
6. **Budgets**: Set category-level limits per month with progress bars and automated over-budget warning badges.
7. **Savings Goals**: Set long-term target savings milestones and fund goals directly from other accounts.
8. **Reports & PDF Export**: Monthly breakdown statements, historical bar trends, CSV data exports, and print-optimized PDF outputs.
9. **AI Spending Insights**: Algorithmic rules recommending budget advice based on your current month savings rate or food spend ratios.
10. **Aesthetics & Theme**: Harmonies of HSL Tailwind styling, premium glassmorphism, glowing accents, and smooth Dark/Light mode transition.

---

## Directory Structure

```text
walletwise/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── src/
│   │   ├── config/          # DB config, Auth keys
│   │   ├── controllers/     # Route controllers (Auth, Incomes, Expenses, Budgets, Goals, Accounts, Transfers)
│   │   ├── middleware/      # Auth, Error handling
│   │   ├── models/          # Mongoose Schemas (User, Income, Expense, Budget, SavingsGoal, Account, Transfer)
│   │   ├── routes/          # Express route declarations
│   │   └── app.js           # Server initialization
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # UI components (Sidebar, StatCard, ThemeToggle, ProtectedLayout)
    │   ├── context/         # React Contexts (AuthContext, ThemeContext)
    │   ├── pages/           # Pages (Dashboard, Accounts, Income, Expenses, Budgets, Goals, Reports, Login, Register, ForgotPassword)
    │   ├── services/        # API Axios configurations
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── Dockerfile
    ├── nginx.conf           # Custom Nginx reverse proxy configuration
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Environment Variables

### Backend (`backend/.env` or docker-compose environments)
- `PORT`: Server port (default `5000`)
- `MONGO_URI`: MongoDB connection string (default `mongodb://mongodb:27017/walletwise`)
- `JWT_SECRET`: Secret key for JWT encryption

### Frontend (`frontend/.env` or docker-compose environments)
- `VITE_API_URL`: Root endpoint of the API backend (default `/api` mapped via Nginx)

---

## Getting Started & Installation

### Option 1: Run with Docker (Recommended)
Make sure you have Docker and Docker Compose installed. Execute the following command in the root folder:

```bash
docker compose up -d --build
```

This starts three services:
1. **mongodb** (running on port `27017`)
2. **backend** (running on port `5000`)
3. **frontend** (served via Nginx on port `80`)

Open your browser and navigate to: **`http://localhost`**

To stop the services:
```bash
docker compose down
```

### Option 2: Local Development Setup
If running locally, start MongoDB on your system, then:

#### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## API Documentation

All routes (except `/api/auth/register` and `/api/auth/login`) require a JWT header: `Authorization: Bearer <token>`.

### Authentication
- `POST /api/auth/register`: Create user account. Body: `{ name, email, password }`
- `POST /api/auth/login`: Authenticate and receive token. Body: `{ email, password }`
- `GET /api/auth/profile`: Fetch current user info.

### Account Management
- `GET /api/accounts`: Fetch all accounts. (Seeds Checking, Savings, and Cash automatically for new users).
- `POST /api/accounts`: Create account. Body: `{ name, type, balance }`
- `PUT /api/accounts/:id`: Update account name, type, or balance.
- `DELETE /api/accounts/:id`: Delete account.

### Transfer Operations
- `GET /api/transfers`: Fetch transfer history.
- `POST /api/transfers`: Execute transfer between two wallets (Atomic & Idempotent). Body: `{ fromAccountId, toAccountId, amount, description, idempotencyKey }`

### Income Management
- `GET /api/income`: Get income logs.
- `POST /api/income`: Create income. Body: `{ title, amount, date, category, accountId }`
- `PUT /api/income/:id`: Update income.
- `DELETE /api/income/:id`: Delete income.

### Expense Management
- `GET /api/expense`: Get expense logs.
- `POST /api/expense`: Create expense. Body: `{ title, amount, date, category, accountId }` (Checks for overdraft).
- `PUT /api/expense/:id`: Update expense. (Checks for overdraft).
- `DELETE /api/expense/:id`: Delete expense.

### Budget Management
- `GET /api/budget`: Fetch category budgets.
- `POST /api/budget`: Set/Upsert budget. Body: `{ category, amount, month }`
- `PUT /api/budget/:id`: Update budget amount.
- `DELETE /api/budget/:id`: Delete budget.

### Savings Goals
- `GET /api/goals`: Get savings goals.
- `POST /api/goals`: Create goal. Body: `{ title, targetAmount, currentAmount, deadline }`
- `PUT /api/goals/:id`: Update savings goals.
- `DELETE /api/goals/:id`: Delete goal.
