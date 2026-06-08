# 🛠️ AI Tools Directory

A full-stack, feature-rich directory platform for discovering, reviewing, and managing AI tools. Users can search and filter tools, upvote their favorites, bookmark them for later, write reviews, and submit new AI tools. Administrators have access to a robust admin dashboard for managing submissions, categories, users, and site metrics.

---

## 🌟 Key Features

### **For Users**
- 🔍 **Search & Filter:** Find AI tools easily with powerful search and category/pricing filters.
- 🔺 **Upvote System:** Upvote tools to help the community discover the best options.
- 📑 **Bookmarks:** Save favorite AI tools to your personal profile.
- 💬 **Reviews & Ratings:** Write reviews and rate AI tools to share feedback.
- 📤 **Tool Submission:** Submit new AI tools to the directory (requires admin approval).
- 🔔 **Notifications:** Get real-time updates when your submitted tool is approved or featured.

### **For Admins**
- 📊 **Dashboard Statistics:** View site-wide analytics including total tools, total users, pending approvals, and upvotes.
- ⚙️ **Submission Management:** Review, approve, feature, or delete submitted AI tools.
- 📁 **Category Control:** Create, update, or delete categories.

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Fast, component-based user interface |
| **Styling** | **Tailwind CSS (v4)** | Modern, utility-first CSS styling |
| **Routing** | **React Router DOM v6** | Client-side routing |
| **Icons** | **Lucide React** | Clean, modern icon set |
| **Backend** | **Node.js + Express** | Scalable, lightweight REST API server |
| **Database** | **MySQL + Sequelize** | Relational database with robust ORM |
| **Auth** | **JWT (JSON Web Tokens)** | Secure token-based authentication |
| **File Upload** | **Multer** | Local storage image uploading |

---

## 📁 Project Structure

```text
ai-tools-directory/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # Auth and global state contexts
│   │   ├── pages/          # Page views (Home, Detail, Submit, Admin, etc.)
│   │   ├── services/       # API call handlers (Axios)
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express Backend
│   ├── config/             # Database connection configuration
│   ├── controllers/        # Request-response logic
│   ├── middleware/         # Auth, Role-checking, and error middlewares
│   ├── models/             # Sequelize database models
│   ├── routes/             # API Endpoint definitions
│   ├── scripts/            # Database seed and utility scripts
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- MySQL Server running locally or in the cloud

### 1. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure your variables:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   
   # MySQL Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ai_tools_db
   DB_PORT=3306
   ```
4. Run the database seed script to populate initial categories and test tools:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at the local URL (usually `http://localhost:5173`).

---

## 🛡️ License

This project is licensed under the MIT License.
