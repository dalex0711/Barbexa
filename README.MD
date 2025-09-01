🪈 Barbexa — Plataforma de Gestión para Barberías

Barbexa es una plataforma full-stack para gestionar usuarios, barberos, servicios y reservas, con un frontend interactivo y un backend robusto.

🧭 Tabla de Contenidos

Tecnologías
Arquitectura
Estructura del Proyecto
Características Principales
Instalación y Configuración
Scripts Disponibles
API (Resumen)
Buenas Prácticas Implementadas
Roadmap
Contribución
Licencia

🧰 Tecnologías
Frontend
JavaScript (ES6+), HTML5 semántico, CSS3 (Flexbox & Grid)
Vite como bundler
UI dinámica: catálogos, filtros, pestañas, formularios con validación
Backend
Node.js + Express
Rutas RESTful y middlewares
JWT en cookies HttpOnly
Conexión a base de datos: MySQL / PostgreSQL / MongoDB

🏗 Arquitectura
```text
Cliente (Vite, JS, HTML, CSS)
        │  fetch (HTTP)
        ▼
Backend (Express + Middlewares)
        │  ORM / Query
        ▼
Base de Datos (MySQL / PostgreSQL / MongoDB)

📁 Estructura del Proyecto
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

✨ Características Principales

Autenticación y Sesión: Login, JWT HttpOnly, logout seguro

Servicios: Catálogo, búsqueda y filtrado, cálculo automático

Barberos: Listado y selección en reservas

Reservas: Formulario completo, validaciones, tabla de reservas, cancelaciones, filtros

Interactividad UI: Navbar, menú hamburguesa, pestañas dinámicas, actualización de totales

⚙ Instalación y Configuración
Requisitos

Node.js v18+

npm o yarn

Base de datos MySQL (recomendado)



1️⃣ Backend
cd server
npm install


Crea un archivo .env basado en .env.example:

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


Levanta el backend en modo desarrollo:

npm run dev


El servidor se iniciará por defecto en http://localhost:3000.




2️⃣ Frontend
cd ../client
npm install
npm run dev


Abre en tu navegador la URL que indique Vite (por defecto http://localhost:5173).



🧪 Scripts Disponibles

Frontend (client/package.json)

Comando	Descripción
dev	Levanta Vite en desarrollo
build	Build de producción
preview	Previsualizar build

Backend (server/package.json)

Comando	Descripción
dev	Levanta servidor con nodemon
start	Levanta servidor con Node
🔗 API (Resumen)

Prefijo base: http://localhost:3000




Auth

POST /login — Iniciar sesión

POST /register — Registrar usuario

GET /profile — Perfil de usuario autenticado

POST /logout — Cerrar sesión

Usuarios

GET /usersCount — Total de usuarios

GET /barberUser — Listado de barberos

GET /users — Listado de usuarios

Servicios

GET /services — Listado

POST /services — Crear (Admin)

PUT /services/:id — Actualizar (Admin)

DELETE /services/:id — Eliminar (Admin)

POST /barbers/:barberId/services — Asignar servicios (Admin)

Reservas

POST /reservations — Crear reserva

GET /reservations — Listar

GET /reservations/detail/:id — Detalle

PUT /reservations/:id/cancel — Cancelar reserva




✅ Buenas Prácticas Implementadas

async/await para asincronía

Manejo de errores con try/catch

Validación de formularios antes de llamadas HTTP

Debounce en inputs de búsqueda

Utilidades seguras para DOM: $, $$, esc

Separación de responsabilidades (UI, auth, HTTP wrapper)

Estructura modular y escalable

🗺 Roadmap

Disponibilidad en tiempo real por barbero

Panel Admin completo

Notificaciones (email / push)

UI/UX mobile-first mejorada

OAuth (Google/Facebook)

Historial y estadísticas de reservas

🤝 Contribución
git checkout -b feature/nombre-feature
git commit -m "feat: agrega nueva funcionalidad X"
git push origin feature/nombre-feature


Luego abre un Pull Request explicando tus cambios.

📄 Licencia

MIT License — Libre uso, modificación y distribución con atribución.