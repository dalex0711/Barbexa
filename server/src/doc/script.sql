

CREATE DATABASE barbexa;
USE barbexa;

/* TABLAS DE CONFIGURACION BASICA */
CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES rol(id) ON DELETE RESTRICT
);

/* TABLAS DE SERVICIOS Y COMBOS */
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    duration TIME NOT NULL
);

CREATE TABLE combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    duration TIME NOT NULL
);

CREATE TABLE combo_service (
    id_combo INT NOT NULL,
    id_service INT NOT NULL,
    PRIMARY KEY (id_combo, id_service),
    FOREIGN KEY (id_combo) REFERENCES combos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_service) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE barber_combos (
    barber_id INT NOT NULL,
    combo_id INT NOT NULL,
    PRIMARY KEY (barber_id, combo_id),
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE
);

/* DISPONIBLIDAD DEL BARBERO*/
CREATE TABLE barber_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, 
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE
);

/* RESERVAS  */
CREATE TABLE status_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

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

CREATE TABLE reservation_service (
    service_id INT NOT NULL,
    reservation_id INT NOT NULL,
    PRIMARY KEY (service_id, reservation_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

CREATE TABLE reservation_combos (
    reservation_id INT NOT NULL,
    combo_id INT NOT NULL,
    PRIMARY KEY (reservation_id, combo_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE
);

/* HISTORIAL DE ESTADO DE RESERVAS */
CREATE TABLE reservation_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_by INT NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status_reservation(id) ON DELETE RESTRICT,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
);
