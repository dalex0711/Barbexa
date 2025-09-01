# 💈 Barbexa — Barbershop Management System  

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)  ![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)  ![Vite](https://img.shields.io/badge/Vite-Frontend-blueviolet?logo=vite)  ![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql)  ![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)  ![License](https://img.shields.io/badge/License-MIT-lightgrey)  

Barbexa is a full-stack web application designed to simplify barbershop operations.  
It provides a **Single Page Application (SPA) frontend** and a **REST API backend**, enabling appointment scheduling, client and barber management, service configuration, and business performance tracking.  

---

## 🚀 Features  

- 📅 **Online Booking** with real-time availability  
- 👥 **Client Profiles** and appointment history  
- 💈 **Barber Schedules** and shift management  
- 💰 **Configurable Services & Combos** with dynamic pricing  
- 🔐 **JWT Authentication** stored in secure HttpOnly cookies  
- 🛡️ **Role-Based Access Control** (Admin, Barber, Client)  
- 📊 **Admin Dashboard** with business metrics  
- 📱 **Responsive Design** for mobile and desktop  

---

## 🏗 Architecture  

```text
Client (Vite, JS, HTML, CSS)
        │  fetch (HTTP)
        ▼
Backend (Express + Middlewares)
        │
        ▼
Database (MySQL)
```

---

## 📂 Project Structure  

```text
Barbexa-main/
├── client/                     # Frontend (SPA with Vite/JS)
│   ├── public/                 # Static assets (images, CSS, etc.)
│   └── src/
│       ├── api/                # API connection layer
│       ├── controllers/        # View controllers
│       ├── services/           # Client-side business logic
│       └── views/              # HTML partial templates
│
└── server/                     # Backend (REST API with Express)
    └── src/
        ├── config/             # DB and app configuration
        ├── controllers/        # Route handlers
        ├── doc/                # SQL scripts and documentation
        ├── middlewares/        # Express middlewares
        ├── repositories/       # Database queries
        ├── routes/             # API routes
        ├── services/           # Business logic
        └── shared/             # Utilities and helpers
```

---

## 🛠 Tech Stack  

- **Frontend:** HTML5, CSS3, JavaScript, Vite, custom SPA Router  
- **Backend:** Node.js, Express, mysql2/promise  
- **Database:** MySQL (pool + parameterized queries)  
- **Authentication:** JWT + bcrypt  
- **Utilities:** dotenv, dayjs  
- **Infrastructure:** CORS-enabled client-server integration  

---

## ⚙️ Environment Variables  

Create a `.env` file inside the backend root (`server/`):  

```env
# General
PORT=3000

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES=1h
```

---

## 🚀 Getting Started  

### 1) Clone repository  
```bash
git clone https://github.com/dalex0711/Barbexa.git
cd Barbexa
```

### 2) Backend Setup  
```bash
cd server
npm install
# create .env file
npm run dev
```

### 3) Frontend Setup  
```bash
cd client
npm install
npm run dev
```

---

## 🔑 API Endpoints  

### 🔐 Authentication  
- `POST /login` — User login  
- `POST /register` — User registration  
- `GET /profile` — Authenticated user profile  
- `POST /logout` — Logout  

### 👥 Users  
- `GET /usersCount` — Get total users  
- `GET /barberUser` — List barbers  
- `GET /users` — List all users  

### 💈 Services  
- `POST /services` — Create service *(Admin only)*  
- `GET /services` — Get active services  
- `PUT /services/:id` — Update service *(Admin only)*  
- `DELETE /services/:id` — Delete service *(Admin only)*  
- `POST /barbers/:barberId/services` — Assign services to barber *(Admin only)*  

### 📅 Reservations  
- `POST /reservations` — Create reservation  
- `GET /reservations/detail/:id` — Reservation details  
- `GET /reservations/list` — List reservations with filters  
- `PATCH /reservations/:id/status` — Update reservation status  
- `GET /reservations/barber/:barberId/availability` — Get barber availability  

### 🎁 Combos  
- `POST /combos` — Create combo *(Admin only)*  
- `GET /combos` — List active combos  
- `PUT /combos/:id` — Update combo *(Admin only)*  
- `DELETE /combos/:id` — Delete combo *(Admin only)*  
- `POST /combos/:id/services` — Assign services to combo *(Admin only)*  

---

## 🔒 Security  

- Passwords hashed with **bcrypt**  
- JWT stored in **HttpOnly cookies** (`SameSite=None; Secure` in production)  
- Role-based access control (Admin, Barber, Client)  
- Centralized error handling & input validation  
- Configured CORS for client-server communication  

---

## 👥 User Roles  

- **Client** → Book appointments, view history, manage profile  
- **Barber** → Manage schedule, availability, and appointments  
- **Admin** → Manage staff, services, combos, and reports  

---

## 📜 License  

© 2025 Barbexa. MIT License.  
