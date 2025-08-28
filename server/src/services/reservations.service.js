import * as repo from "../repositories/reservations.repository.js";
import { combosRepository as crepo } from "../repositories/combos.repository.js";
import dayjs from "dayjs";

export const createReservation = async ({
  client_id, barber_id, services = [], combos = [],
  start_at, notes, userIdFromJwt
}) => {
  if (!client_id) client_id = userIdFromJwt;

  // Debe tener al menos servicios o combos
  if ((!services || services.length === 0) && (!combos || combos.length === 0)) {
    throw new Error("Debe indicar al menos un servicio o combo");
  }

  // Validar servicios
  if (services.length) {
    await repo.assertServicesEnabled(services);
    await repo.assertBarberProvidesServices(barber_id, services);
  }

  // Validar combos
  if (combos.length) {
    await crepo.assertCombosEnabled(combos);
    // (opcional) validar que el barbero ofrezca todos los servicios del combo
  }

  // Calcular duración
  let totalMin = 0;
  totalMin += await repo.getTotalServiceMinutes(services);

  for (const comboId of combos) {
    const combo = await crepo.getComboById(comboId);
    const items = await crepo.getComboServices(comboId);

    if (combo?.duration_override) {
      const [hh, mm, ss] = combo.duration_override.split(":").map(Number);
      totalMin += (hh * 60 + mm + Math.floor((ss || 0) / 60));
    } else {
      for (const it of items) {
        const [hh, mm, ss] = String(it.duration).split(":").map(Number);
        const mins = (hh * 60 + mm + Math.floor((ss || 0) / 60)) * (it.quantity || 1);
        totalMin += mins;
      }
    }
  }

  if (totalMin <= 0) throw new Error("Duración total inválida");

  const start = dayjs(start_at);
  const end = start.add(totalMin, "minute").toDate();

  // Validar solapamiento
  const overlap = await repo.existsOverlap(barber_id, new Date(start_at), end);
  if (overlap) throw new Error("El barbero ya tiene una reserva en ese rango");

  // Crear transacción con combos incluidos
  const reservation = await repo.createReservationTx({
    status_id: 1,
    client_id,
    barber_id,
    notes,
    start_at: new Date(start_at),
    end_at: end,
    services,
    combos
  });

  return reservation;
};

export const getReservationById = (id) => repo.getReservationById(id);
export const listReservations = (filters) => repo.listReservations(filters);
export const updateReservationStatus = (id, status_id) =>
  repo.updateReservationStatus(id, status_id);
export const getBarberDayAvailability = (barber_id, dateStr) => {
  const dayStart = dayjs(dateStr).startOf("day").toDate();
  const dayEnd   = dayjs(dateStr).endOf("day").toDate();
  return repo.getBarberBusyRanges(barber_id, dayStart, dayEnd);
};
