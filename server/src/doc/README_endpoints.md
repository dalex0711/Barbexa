# Barbexa API — Endpoints (Front ⇄ Back)

> **Importante**
> - Las rutas **no** tienen prefijo (`/auth/...`). Son simples: `/login`, `/register`, etc.
> - El backend usa **cookie JWT** (`token`). El frontend debe llamar con `credentials: "include"` para que el navegador **envíe y reciba** la cookie.
> - Configura CORS en el servidor con `credentials: true` y `origin` del front.

---

## 🔧 Base
- **Base URL (local)**: `http://localhost:3000`
- **Formato**: JSON (`Content-Type: application/json`)
- **Cookies**: `token` (HttpOnly). Se setea al hacer `POST /login`.


   COLOCARLO: credentials: "include", // necesario para cookie


---

## 🔐 Autenticación

### POST `/login`
Inicia sesión y setea cookie `token`.

**Body:**
```json
{ "email": "user@example.com", "password": "Passw0rd" }
```

**Respuesta:**
```json
{ "message": "Login successful" }
```

### POST `/register`
Crea un usuario.

**Body:**
```json
{
  "username": "Sergio",
  "email": "user@example.com",
  "password": "Passw0rd",
  "code_name": "CLIENT_03"
}
```

### GET `/profile`
Devuelve datos del usuario autenticado.  
Requiere cookie `token`.

**Respuesta:**
```json
{
  "message":"User profile",
  "user": { "id": 3, "username": "Sergio", "code_name": "CLIENT_03" }
}
```

### POST `/logout`
Elimina cookie `token`.

**Respuesta:**
```json
{ "message": "logout successfully" }
```

---

## 👤 Usuarios

### GET `/usersCount`
**Respuesta:**
```json
{ "count": 12 }
```

### GET `/barberUser`
**Respuesta:**
```json
{ "barberUser": [ { "username": "Barbero 1" }, { "username": "Barbero 2" } ] }
```

---

## 💈 Servicios

> Crear/editar/eliminar/asignar servicios: **solo ADMIN**.

### POST `/services`
```json
{ "name":"Corte","price":15000,"duration":"00:30:00","description":"Corte clásico" }
```

### GET `/services`
Devuelve lista de servicios habilitados.

### PUT `/services/:id`
```json
{ "name":"Corte premium","price":18000,"duration":"00:40:00","description":"Con lavado" }
```

### DELETE `/services/:id`
Soft delete.  
**Respuesta:**
```json
{ "message":"Service deleted successfully" }
```

### POST `/barbers/:barberId/services`
```json
{ "services":[1,2,3] }
```

---

## 🧩 Combos

> Mutaciones: **solo ADMIN**. Listar: cualquier usuario autenticado.

### POST `/combos`
```json
{
  "name":"Corte + Barba",
  "description":"Paquete clásico",
  "price": null,
  "discount_percent": 10,
  "duration_override": null
}
```

### GET `/combos`
Devuelve lista de combos habilitados.

### PUT `/combos/:id`
Actualiza un combo.

### DELETE `/combos/:id`
Soft delete.  
**Respuesta:**
```json
{ "message":"Combo deleted successfully" }
```

### POST `/combos/:id/services`
```json
{ "services":[ { "service_id":1,"quantity":1 }, { "service_id":2,"quantity":1 } ] }
```

---

## 📅 Reservas

Una reserva puede incluir **solo servicios**, **solo combos**, o ambos.

### POST `/reservations`
```json
{
  "client_id": 3,
  "barber_id": 2,
  "services": [1],
  "combos": [1],
  "start_at": "2025-08-28T15:00:00",
  "notes": "Ejemplo"
}
```

### GET `/reservations/detail/:id`
Devuelve detalle de la reserva.

### GET `/reservations/list`
Filtros: `client_id`, `barber_id`, `status_id`, `from`, `to`, `limit`.

### PATCH `/reservations/:id/status`
```json
{ "status_id": 2 }
```

### GET `/reservations/barber/:barberId/availability?date=YYYY-MM-DD`
Devuelve rangos ocupados del barbero en esa fecha.

---

## 🍪 Cookies (frontend)
Siempre usar `credentials: "include"`:
```js
await fetch("http://localhost:3000/profile", {
  credentials: "include"
});
```

---

## ❗️Formato de error
```json
{ "error": "Mensaje de error" }
```
o con `errorMiddleware` central:
```json
{ "ok": false, "error": "Mensaje de error" }
```
