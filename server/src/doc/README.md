# 📖 Documentación API Barbexa

API REST para la gestión de **usuarios**, **servicios** y **reservas** en la plataforma Barbexa.  
Arquitectura en capas: `routes → controllers → services → repositories → database`.

---

## 🔑 Autenticación (`/auth`)

### POST `/auth/register`
Registra un usuario nuevo.
```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "Abc123",
  "code_name": "CLIENT_03"
}
```
- **201 Created** → `{ ...usuarioCreado }`  
- **400 Bad Request** → `{ "error": "mensaje" }`

---

### POST `/auth/login`
Inicia sesión, devuelve cookie `token` (JWT).
```json
{ "email": "juan@example.com", "password": "Abc123" }
```
- **200 OK** → `{ "message": "Login successful" }`  
- **401 Unauthorized** → `{ "error": "mensaje" }`

---

### GET `/auth/profile`
Perfil del usuario autenticado.  
- **200 OK** → `{ "message": "User profile", "user": { ... } }`  
- **401 Unauthorized** si no hay token válido.

---

### POST `/auth/logout`
Cierra sesión (borra cookie JWT).  
- **200 OK** → `{ "message": "Logout successfully" }`

---

## 👥 Usuarios (`/users`)

### GET `/usersCount`
Devuelve el número total de usuarios activos.  
- **200 OK** → `{ "count": 42 }`

---

### GET `/barberUser`
Lista usuarios con rol `BARBER_02`.  
- **200 OK** → `{ "barberUser": [ { "username": "barbero1" } ] }`

---

## 💈 Servicios (`/services`, `/barbers/:barberId/services`)

### POST `/services` *(admin)*
Crea un nuevo servicio.
```json
{
  "name": "Corte",
  "price": 25000,
  "duration": "00:30:00",
  "description": "Corte clásico"
}
```
- **201 Created** → `{ "message": "Service created successfully" }`  
- **400 Bad Request** → `{ "error": "mensaje" }`

---

### GET `/services`
Lista servicios habilitados.  
- **200 OK** → `[ { "id": 1, "name": "Corte", "price": 25000 } ]`

---

### DELETE `/services/:id` *(admin)*
Deshabilita un servicio por ID.  
- **200 OK** → `{ "message": "Service deleted successfully" }`

---

### PUT `/services/:id` *(admin)*
Actualiza un servicio.
```json
{
  "name": "Corte Premium",
  "price": 30000,
  "duration": "00:45:00",
  "description": "Corte + lavado"
}
```
- **200 OK** → `{ "message": "Service updated successfully" }`

---

### POST `/barbers/:barberId/services` *(admin)*
Asigna varios servicios a un barbero.
```json
{ "services": [1, 2, 3] }
```
- **201 Created** → `{ "message": "Services assigned to barber successfully" }`

---

## 📅 Reservas (`/reservations`)

### POST `/reservations`
Crea una reserva.
```json
{
  "client_id": 3,
  "barber_id": 2,
  "services": [1, 2],
  "start_at": "2025-08-28T15:00:00",
  "notes": "Corte + barba"
}
```
- **201 Created** → Reserva creada (con servicios incluidos).  
- **400/409** → `{ "error": "El barbero ya tiene una reserva en ese rango" }`

---

### GET `/reservations/detail/:id`
Detalle de una reserva (incluye servicios).  
- **200 OK** → objeto reserva.  
- **404 Not Found** → `{ "message": "Not found" }`

---

### GET `/reservations/list`
Lista reservas con filtros opcionales:
- `?client_id=3`  
- `?barber_id=2`  
- `?status_id=1`  
- `?from=2025-08-28&to=2025-08-29`  

**Respuesta:** array de reservas.

---

### PATCH `/reservations/:id/status`
Cambia el estado de una reserva.
```json
{ "status_id": 2 }
```
- **200 OK** → reserva actualizada.  

---

### GET `/reservations/barber/:barberId/availability?date=YYYY-MM-DD`
Muestra los rangos ocupados de un barbero en un día.  
- **200 OK** →  
```json
[
  { "start_at": "2025-08-28T15:00:00", "end_at": "2025-08-28T15:30:00", "status_id": 1 }
]
```

---

## ⚠️ Notas
- La mayoría de endpoints requieren cookie `token` (JWT).  
- Fechas deben enviarse en formato ISO (`YYYY-MM-DDTHH:mm:ss`).  
- Validaciones: 
  - `price` debe ser entero.  
  - `duration` formato `HH:mm:ss`.  
  - `description` máximo 255 caracteres.  
