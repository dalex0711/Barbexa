// /src/controllers/barbers.js
import { apiRequest } from "../api/request.js";
import { getLoggedUser, logoutUser } from '../services/auth.js';


export async function init(){
  const tbody        = document.querySelector("#reservationsTable tbody");
  const emptyMsg     = document.getElementById("emptyMsg");
  const filterTime   = document.getElementById("filterTime");
  const filterStatus = document.getElementById("filterStatus");
  const btnReload    = document.getElementById("btnReload");
  const btnLogout    = document.getElementById("btnLogout");

  // ====== Mobile menu toggle ======
  const menuToggle = document.getElementById("menuToggle");
  const mainMenu   = document.getElementById("mainMenu");
  menuToggle?.addEventListener("click", ()=> mainMenu?.classList.toggle("open"));

  // ====== Barber ID from logged user ======
  let BARBER_ID = null;
  try {
    const user = await getLoggedUser();
    if (user?.id && user?.code_name === "BARBER_02") {
      BARBER_ID = user.id;
    }
  } catch (e) {
    console.error("Failed to get logged user:", e);
  }

  if (!BARBER_ID) {
    alert("Barber ID not found. Please login again.");
    window.location.href = "/login";
    return;
  }

  // ====== Local state ======
  let all = [];   // all reservations
  let view = [];  // filtered view

  // Reservation status mapping
  const STATUS_MAP = {
    1: "PENDING",
    2: "CONFIRMED",
    3: "COMPLETED",
    4: "CANCELLED"
  };
  const NAME_TO_ID = Object.fromEntries(Object.entries(STATUS_MAP).map(([id,nm])=>[nm,id]));

  // ====== Utils ======
  const pad = n => String(n).padStart(2,"0");
  const toDateParts = iso => {
    const d = new Date(iso);
    const dd = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const hh = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date: dd, time: hh };
  };
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // Render reservations into the table
  function paint(list){
    tbody.innerHTML = "";
    if (!list.length){
      emptyMsg.style.display = "block";
      return;
    }
    emptyMsg.style.display = "none";

    list.forEach(r=>{
      const { date: startDate, time: startTime } = toDateParts(r.start_at);
      const { time: endTime } = toDateParts(r.end_at);
      const stName = r.status_name || STATUS_MAP[r.status_id] || "PENDING";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td data-label="ID">${r.id}</td>
        <td data-label="Client">${escapeHtml(r.client_name)}</td>
        <td data-label="Date">${startDate}</td>
        <td data-label="Start">${startTime}</td>
        <td data-label="End">${endTime}</td>
        <td data-label="Note">${escapeHtml(r.notas || "")}</td>
        <td data-label="Status">
          <span class="status-pill st-${stName}">${stName}</span>
        </td>
        <td data-label="Change Status" class="actions-cell">
          <select class="select statusSel">
            <option value="PENDING"   ${stName==="PENDING"?"selected":""}>PENDING</option>
            <option value="CONFIRMED" ${stName==="CONFIRMED"?"selected":""}>CONFIRMED</option>
            <option value="COMPLETED" ${stName==="COMPLETED"?"selected":""}>COMPLETED</option>
            <option value="CANCELLED" ${stName==="CANCELLED"?"selected":""}>CANCELLED</option>
          </select>
          <button class="btn btnSaveStatus">Save</button>
        </td>
      `;

      // Save new status
      tr.querySelector(".btnSaveStatus").addEventListener("click", async ()=>{
        const sel = tr.querySelector(".statusSel");
        const newName = sel.value;
        const newId   = NAME_TO_ID[newName] ?? 1;

        const btn = tr.querySelector(".btnSaveStatus");
        const prev = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Saving...";

        try{
          await apiRequest("PATCH", `/reservations/${r.id}/status`, { status_id: newId });
          r.status_id = newId;
          r.status_name = newName;
          paint(view);
        }catch(e){
          alert(e.message || "Failed to update status.");
        }finally{
          btn.disabled = false;
          btn.textContent = prev;
        }
      });

      tbody.appendChild(tr);
    });
  }

  // Apply filters for time and status
  function applyFilter(){
    const t = (filterTime?.value || "").trim();   // HH:MM
    const s = (filterStatus?.value || "").trim(); // status name

    view = all.filter(r=>{
      let ok = true;
      if (t){
        const hh = toDateParts(r.start_at).time;
        ok = ok && (hh === t);
      }
      if (s){
        const stName = r.status_name || STATUS_MAP[r.status_id] || "PENDING";
        ok = ok && (stName === s);
      }
      return ok;
    });

    paint(view);
  }

  // Load reservations from API
  async function loadReservations(){
    try {
      const data = await apiRequest("GET", `/reservations/list?barber_id=${BARBER_ID}`);
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.reservations) ? data.reservations : []);
      all = arr;
    } catch (e) {
      console.error(e);
      all = [];
    }
    applyFilter();
  }

  // ====== Events ======
  filterTime?.addEventListener("input", applyFilter);
  filterStatus?.addEventListener("change", applyFilter);
  btnReload?.addEventListener("click", loadReservations);

  btnLogout?.addEventListener("click", async () => {
    console.log("Logging out...");
    try {
      await apiRequest("POST", "/logout", {});
    } catch (e) {
      console.error("Logout API failed:", e);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login"; // o "/login.html" según tu estructura
    }
  });

async function mostrarUsuario() {
  const user = await getLoggedUser();
  
  if (user) {
    console.log("Usuario logueado:", user);
  } else {
    console.log("No hay usuario logueado");
  }
}

mostrarUsuario();


async function cerrarSesion() {
  try {
    const res = await logoutUser();
    console.log(res.message); // "logout successfully"
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
}

cerrarSesion();



  // ====== First load ======
  loadReservations();
}
