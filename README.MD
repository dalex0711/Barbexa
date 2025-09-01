🪈 Barbexa — Barbershop Management Platform

Barbexa is a full-stack platform to manage users, barbers, services, and bookings, featuring an interactive frontend and a robust backend.

🧭 Table of Contents

Technologies

Architecture

Project Structure

Key Features

Installation & Setup

Available Scripts

API (Summary)

Best Practices Implemented

Roadmap

Contributing

License

🧰 Technologies
Frontend

JavaScript (ES6+), Semantic HTML5, CSS3 (Flexbox & Grid)

Vite as bundler

Dynamic UI: catalogs, filters, tabs, and validated forms

Backend

Node.js + Express

RESTful routes & middlewares

JWT in HttpOnly cookies

Database connection: MySQL / PostgreSQL / MongoDB

🏗 Architecture
```text
Cliente (Vite, JS, HTML, CSS)
        │  fetch (HTTP)
        ▼
Backend (Express + Middlewares)
        │  ORM / Query
        ▼
Base de Datos (MySQL / PostgreSQL / MongoDB)

📁 Project estructure
```text
Barbexa/
├─ client/                  # Frontend
│  ├─ public/               # Archivos estáticos (favicon, imágenes)
│  ├─ src/                  # Código fuente
│  │  ├─ api/               # Wrappers de fetch (request.js)
│  │  ├─ controllers/       # Lógica de UI por vista
│  │  ├─ services/          # auth.js, helpers, validaciones
│  │  ├─ views/             # HTML parciales / templates
│  │  └─ router.js          # Enrutador del cliente
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
└─ server/                  # Backend
   ├─ src/
   │  ├─ controllers/       # Controladores (auth, services, reservations, etc.)
   │  ├─ middlewares/       # authMiddleware, manejo de errores
   │  ├─ routes/            # Definición de endpoints
   │  ├─ db/                # Conexión y modelos/queries
   │  ├─ utils/             # Helpers varios
   │  ├─ app.js             # Configuración de Express y middlewares
   │  └─ index.js           # Bootstrap del servidor
   ├─ .env.example          # Plantilla de variables de entorno
   ├─ package.json
   └─ README.md

✨ Key Features

Authentication & Session: Login, JWT HttpOnly, secure logout

Services: Catalog, search & filtering, automatic total calculation

Barbers: Listing and selection in bookings

Bookings: Full form, validations, bookings table, cancellations, filters

UI Interactivity: Navbar, hamburger menu, dynamic tabs, live totals

⚙ Installation & Setup
Requirements

Node.js v18+

npm or yarn

MySQL database (recommended)

1️⃣ Backend
cd server
npm install


Create a .env file based on .env.example:

# General
PORT=3000

# Database
DB_HOST=bknzgcqcoozwtrixnlgn-mysql.services.clever-cloud.com
DB_USER=u6fwfkaz1hxon31w
DB_PASSWORD=oa60AATveYBLXaXJE5rt
DB_NAME=bknzgcqcoozwtrixnlgn
DB_PORT=3306

# JWT
JWT_SECRET=my_super_secret_key
JWT_EXPIRES=1h


Start the backend in development:

npm run dev


The server will start by default at http://localhost:3000.

2️⃣ Frontend
cd ../client
npm install
npm run dev


Open in your browser the URL shown by Vite (default http://localhost:5173).

🧪 Available Scripts
Frontend (client/package.json)

dev — Run Vite in development

build — Production build

preview — Preview production build

Backend (server/package.json)

dev — Start server with nodemon

start — Start server with Node

🔗 API (Summary)

Base URL: http://localhost:3000

Auth

POST /login — Sign in

POST /register — Register user

GET /profile — Authenticated user profile

POST /logout — Sign out

Users

GET /usersCount — Total users

GET /barberUser — Barbers list

GET /users — Users list

Services

GET /services — List

POST /services — Create (Admin)

PUT /services/:id — Update (Admin)

DELETE /services/:id — Delete (Admin)

POST /barbers/:barberId/services — Assign services (Admin)

Bookings

POST /reservations — Create booking

GET /reservations — List bookings

GET /reservations/detail/:id — Booking details

PUT /reservations/:id/cancel — Cancel booking

✅ Best Practices Implemented

async/await for async flows

Error handling with try/catch

Form validation before HTTP calls

Debounce in search inputs

Safe DOM utilities: $, $$, esc

Clear separation of concerns (UI, auth, HTTP wrapper)

Modular and scalable structure

🗺 Roadmap

Real-time availability per barber

Full Admin panel

Notifications (email / push)

Improved mobile-first UI/UX

OAuth (Google/Facebook)

Booking history & statistics

🤝 Contributing
git checkout -b feature/your-feature-name
git commit -m "feat: add new feature X"
git push origin feature/your-feature-name


Then open a Pull Request describing your changes.

📄 License

MIT License — Free use, modification, and distribution with attribution.