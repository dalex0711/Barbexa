/* --- Database Creation --- */
CREATE DATABASE barbexa;
USE barbexa;

/* --- Roles catalog --- */
CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code_name VARCHAR(50) UNIQUE
);

/* --- Users --- 
   Application users linked to roles.
   Soft-delete handled with 'enabled'. */
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES rol(id) ON DELETE RESTRICT
);

/* --- Services catalog --- 
   Basic services offered by barbers. */
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    duration TIME NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

/* --- Barber weekly availability --- 
   Defines weekly schedule per barber. */
CREATE TABLE barber_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE
);

/* --- Barber ↔ Services relation --- 
   Which services each barber provides. */
CREATE TABLE barber_services (
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (barber_id, service_id),
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

/* --- Reservation statuses --- 
   Example: PENDING, CONFIRMED, CANCELED. */
CREATE TABLE status_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

/* --- Reservations (header) --- 
   Main booking entity. 
   start_at/end_at define occupied slot. */
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status_id INT NOT NULL,
    client_id INT NOT NULL,
    barber_id INT NOT NULL,
    notas VARCHAR(255),
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    FOREIGN KEY (status_id) REFERENCES status_reservation(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE RESTRICT
);

/* --- Reservation ↔ Services --- 
   Services included in a reservation. */
CREATE TABLE reservation_service (
    service_id INT NOT NULL,
    reservation_id INT NOT NULL,
    PRIMARY KEY (service_id, reservation_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

/* --- Combos catalog --- 
   Grouped offerings (bundled services). */
CREATE TABLE combos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(10,2) NULL,
  discount_percent DECIMAL(5,2) NULL,
  duration_override TIME NULL,
  enabled BOOLEAN NOT NULL DEFAULT 1
);

/* --- Combos ↔ Services relation --- 
   Defines which services are part of a combo. */
CREATE TABLE combo_services (
  combo_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (combo_id, service_id),
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

/* --- Reservation ↔ Combos --- 
   Combos included in a reservation. */
CREATE TABLE reservation_combo (
  combo_id INT NOT NULL,
  reservation_id INT NOT NULL,
  PRIMARY KEY (combo_id, reservation_id),
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

/* --- Helpful indexes --- 
   Improve query performance. */
CREATE INDEX idx_combo_enabled ON combos(enabled);
CREATE INDEX idx_combo_services_combo ON combo_services(combo_id);
CREATE INDEX idx_combo_services_service ON combo_services(service_id);
