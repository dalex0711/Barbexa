# 🧔 Barbexa API  

API backend para gestión de usuarios, barberos, servicios, combos y reservas en una barbería.  
Construida con **Node.js + Express**, **MySQL** y **JWT** siguiendo una **arquitectura en capas** para mantener separación de responsabilidades y facilidad de mantenimiento.  

---

## 📂 Arquitectura en capas  

El proyecto sigue una estructura organizada en capas:  

```
src/
│── config/          # Configuración (DB, variables de entorno, JWT)
│── repositories/    # Acceso a la base de datos (consultas SQL)
│── services/        # Lógica de negocio (validaciones, reglas)
│── controllers/     # Manejo de requests/responses HTTP
│── routes/          # Definición de endpoints y middlewares
│── middlewares/     # Validaciones intermedias (ej. autenticación JWT)
│── shared/          # Utilidades compartidas (validaciones, helpers)
│── index.js         # Punto de entrada de la app
```

### 🔑 Flujo de una petición
1. **Router** recibe la request (`/auth/login`).  
2. **Controller** procesa parámetros y llama al **Service**.  
3. **Service** ejecuta la lógica de negocio y consulta el **Repository**.  
4. **Repository** interactúa con la **Base de Datos (MySQL)**.  
5. El resultado viaja de vuelta al cliente (respuesta JSON).  

---

## ⚙️ Instalación y configuración  

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tuusuario/barbexa-api.git
cd barbexa-api
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno  
Crea un archivo `.env` en la raíz del proyecto:  

```env
# General
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=barbexa
DB_PORT=3306

# JWT
JWT_SECRET=m_1-sup3r-s3-cr3_t0
JWT_EXPIRES=1h
```

### 4️⃣ Ejecutar el servidor
```bash
npm run dev   # con nodemon
```
Servidor disponible en: `http://localhost:3000`  

---

## 🗂 Endpoints principales (Auth)  

### 🔹 Registro
`POST /auth/register`  
```json
{
  "username": "juanp",
  "email": "juan@example.com",
  "password": "Passw0rd"
}
```
✔️ Valida formato de email, password y username.  
✔️ Crea usuario en MySQL (contraseña hasheada con bcrypt).  

---

### 🔹 Login
`POST /auth/login`  
```json
{
  "email": "juan@example.com",
  "password": "Passw0rd"
}
```
✔️ Verifica credenciales.  
✔️ Genera **JWT**.  
✔️ Guarda el token en una cookie segura (`httpOnly`).  

---

### 🔹 Perfil (requiere login)
`GET /auth/profile`  
📌 Requiere cookie `token` enviada automáticamente por el navegador.  
```json
{
  "message": "User profile",
  "user": {
    "username": "juanp",
    "rol": 3
  }
}
```

---

## 🛠 Stack Tecnológico  
- **Node.js + Express** → Servidor HTTP.  
- **MySQL (mysql2/promise)** → Base de datos.  
- **bcrypt** → Hash de contraseñas.  
- **jsonwebtoken** → Manejo de JWT.  
- **cookie-parser** → Manejo de cookies de sesión.  
- **dotenv** → Variables de entorno.  

