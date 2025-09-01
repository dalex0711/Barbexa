// /src/controllers/client.js
import { apiRequest } from "../api/request.js";
import { getLoggedUser } from "../services/auth.js";

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STATUS_MAP = {1:"PENDIENTE", 2:"CONFIRMADA", 3:"COMPLETADA", 4:"CANCELADA"};

function debounce(fn, ms=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

export async function init(){
  // ===== Navbar behavior (hamburger) =====
  const nav = $("#topNav");
  const menuToggle = $("#menuToggle");
  const mainMenu = $("#mainMenu");
  menuToggle?.addEventListener("click", (e)=>{ e.stopPropagation(); mainMenu?.classList.toggle("open"); });
  document.addEventListener("click", (e)=>{ if (!nav?.contains(e.target)) mainMenu?.classList.remove("open"); });
  mainMenu?.addEventListener("click", (e)=>{ const a=e.target.closest("a,[data-link],button"); if (a) mainMenu.classList.remove("open"); });

  // ===== Tabs (3 vistas independientes) =====
  function setTab(tab){
    $$("#mainMenu a[data-tab]").forEach(a=> a.classList.toggle("active", a.dataset.tab===tab));
    $("#view-services").style.display      = tab==="services"     ? "block" : "none";
    $("#view-book").style.display          = tab==="book"         ? "block" : "none";
    $("#view-appointments").style.display  = tab==="appointments" ? "block" : "none";
    if (tab !== "book") window.scrollTo({ top: 0 });
  }
  $$("#mainMenu a[data-tab]").forEach(a=>{
    a.addEventListener("click", (e)=>{ e.preventDefault(); setTab(a.dataset.tab); });
  });

  // ===== Logout =====
  $("#btnLogout")?.addEventListener("click", async ()=>{
    try{ await apiRequest("POST","/logout",{}); }catch{}
    localStorage.clear(); sessionStorage.clear();
    window.location.href="/login";
  });

  // ===== Logged client =====
  let CLIENT_ID = null;
  try{
    const me = await getLoggedUser();
    CLIENT_ID = me?.id;
    if (!CLIENT_ID) throw new Error("No client id");
  }catch(e){
    console.warn(e);
    window.location.href = "/login";
    return;
  }

  // ===== Services Catalog =====
  const catalog = $("#servicesCatalog");
  const svcSearch = $("#svcSearch");
  const servicesEmpty = $("#servicesEmpty");
  let servicesAll = [];                   // [{id,name,price,duration,description},...]
  const priceById = new Map();            // id -> price (para total del book)

  async function loadServices(){
    try{
      const raw = await apiRequest("GET","/services");
      servicesAll = Array.isArray(raw?.services) ? raw.services : (Array.isArray(raw) ? raw : []);
      priceById.clear();
      servicesAll.forEach(s => {
        const id = s.id ?? s.service_id;
        priceById.set(Number(id), Number(s.price || 0));
      });
    }catch{
      servicesAll = [];
      priceById.clear();
    }
  }

  function paintServicesCatalog(list){
    catalog.innerHTML = "";
    if (!list.length){
      servicesEmpty.style.display="block";
      return;
    }
    servicesEmpty.style.display="none";

    list.forEach(s=>{
      const id = s.id ?? s.service_id;
      const card = document.createElement("div");
      card.className = "service-card";
      card.innerHTML = `
        <h3>${esc(s.name || "Service")}</h3>
        <div class="service-meta">${s.duration||s.s_duration||"00:00:00"} · $${Number(s.price||0).toLocaleString()}</div>
        <p class="muted">${esc(s.description || "—")}</p>
        <div class="service-footer">
          <span class="muted">#${id}</span>
          <button class="btn bookNow"><i class="fa-solid fa-calendar-plus"></i> Book now</button>
        </div>
      `;
      card.querySelector(".bookNow").addEventListener("click", ()=>{
        setTab("book");
        $("#svcPickerSearch")?.focus();
      });
      catalog.appendChild(card);
    });
  }

  const onCatalogSearch = debounce(e=>{
    const t = (e.target.value||"").toLowerCase().trim();
    const view = !t ? servicesAll : servicesAll.filter(s => (s.name||"").toLowerCase().includes(t));
    paintServicesCatalog(view);
  }, 200);
  svcSearch?.addEventListener("input", onCatalogSearch);

  // ===== Booking: barbers & picker =====
  const selBarber = $("#barberSel");
  const svcPicker = $("#servicesGroup");
  const svcPickerSearch = $("#svcPickerSearch");
  const errSvc = $("#errServices");
  const svcCount = $("#svcCount");
  const svcTotal = $("#svcTotal");

  async function loadBarbers(){
    try{
      const data = await apiRequest("GET","/barberUser");
      const arr = Array.isArray(data?.barberUser) ? data.barberUser : [];
      selBarber.innerHTML = `<option value="">-- Choose a barber --</option>`;
      arr.forEach(b=>{
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = b.username;
        selBarber.appendChild(opt);
      });
    }catch{/* ignore */}
  }

  function updateTotal(){
    const ids = $$('#servicesGroup input[type="checkbox"]:checked').map(c=>Number(c.value));
    const count = ids.length;
    const total = ids.reduce((sum,id)=> sum + (priceById.get(id)||0), 0);
    svcCount.textContent = String(count);
    svcTotal.textContent = `$${total.toLocaleString()}`;
  }

  function paintPicker(list){
    svcPicker.innerHTML = "";
    list.forEach(s=>{
      const id = s.id ?? s.service_id;
      const div = document.createElement("label");
      div.className = "svc";
      div.innerHTML = `
        <input type="checkbox" value="${id}">
        <span><b>${esc(s.name || "Service")}</b> — ${s.duration||s.s_duration||"00:00:00"} · $${Number(s.price||0).toLocaleString()}</span>
      `;
      const chk = div.querySelector('input[type="checkbox"]');
      chk.addEventListener("change", updateTotal);
      svcPicker.appendChild(div);
    });
    updateTotal();
  }

  const onPickerSearch = debounce(e=>{
    const t = (e.target.value||"").toLowerCase().trim();
    const view = !t ? servicesAll : servicesAll.filter(s => (s.name||"").toLowerCase().includes(t));
    paintPicker(view);
  }, 200);
  svcPickerSearch?.addEventListener("input", onPickerSearch);

  // ===== Book form + My Appointments =====
  const form = $("#formReservation");
  const dateSel = $("#dateSel");
  const timeSel = $("#timeSel");
  const notes = $("#notes");

  const tbody = $("#reservationsTable tbody");
  const emptyMsg = $("#emptyMsg");
  const filterDate = $("#filterDate");
  const filterStatus= $("#filterStatus");
  const btnReload   = $("#btnReloadList");

  let resAll = [], resView = [];
  const pad = n => String(n).padStart(2,"0");
  const parts = iso => {
    const d = new Date(iso);
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
    };
  };

  function paintReservations(list){
    tbody.innerHTML = "";
    if (!list.length){
      emptyMsg.style.display="block";
      return;
    }
    emptyMsg.style.display="none";

    list.forEach(r=>{
      const st = r.status_name || STATUS_MAP[r.status_id] || "PENDIENTE";
      const {date:d, time:t} = parts(r.start_at);
      const {time:tEnd} = parts(r.end_at);
      const svcText = Array.isArray(r.services)
        ? r.services.map(s=>s.name||s).join(", ")
        : (r.service_name || "—");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="ID">${r.id}</td>
        <td data-label="Barber">${esc(r.barber_name || "")}</td>
        <td data-label="Services">${esc(svcText)}</td>
        <td data-label="Date">${d}</td>
        <td data-label="Start">${t}</td>
        <td data-label="End">${tEnd}</td>
        <td data-label="Status"><span class="status-pill st-${st}">${st}</span></td>
        <td data-label="Actions" class="actions-cell">
          ${
            st==="PENDIENTE" || st==="CONFIRMADA"
              ? `<button class="btn danger btnCancel">Cancel</button>`
              : `<span class="muted">—</span>`
          }
        </td>
      `;

      tr.querySelector(".btnCancel")?.addEventListener("click", async ()=>{
        if (!confirm("Cancel this appointment?")) return;
        const btn = tr.querySelector(".btnCancel");
        const prev = btn.textContent;
        btn.disabled=true; btn.textContent="Saving...";
        try{
          await apiRequest("PATCH", `/reservations/${r.id}/status`, { status_id: 3 });
          r.status_id = 4; r.status_name = "CANCELADA";
          paintReservations(resView);
        }catch(e){
          alert(e.message || "Cancel failed");
        }finally{
          btn.disabled=false; btn.textContent=prev;
        }
      });

      tbody.appendChild(tr);
    });
  }

  function applyResFilter(){
    const fd = (filterDate?.value || "").trim();
    const fs = (filterStatus?.value || "").trim();
    resView = resAll.filter(r=>{
      let ok = true;
      if (fd){ ok = ok && (parts(r.start_at).date === fd); }
      if (fs){ ok = ok && ((r.status_name || STATUS_MAP[r.status_id]) === fs); }
      return ok;
    });
    paintReservations(resView);
  }

  async function loadMyReservations(){
    try{
      const data = await apiRequest("GET", `/reservations/list?client_id=${CLIENT_ID}`);
      resAll = Array.isArray(data) ? data : (Array.isArray(data?.reservations) ? data.reservations : []);
    }catch{
      resAll = [];
    }
    applyResFilter();
  }

  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();

    const barber_id = Number(selBarber.value);
    const services = $$('#servicesGroup input[type="checkbox"]:checked').map(c=>Number(c.value));
    const dateStr = dateSel.value;
    const timeStr = timeSel.value;
    const note = notes.value.trim();

    let ok = true;
    if (!barber_id){ selBarber.classList.add("has-error"); ok=false; } else { selBarber.classList.remove("has-error"); }
    if (!services.length){ $("#errServices").textContent = "Select at least one service."; ok=false; } else { $("#errServices").textContent=""; }
    if (!dateStr){ dateSel.classList.add("has-error"); ok=false; } else { dateSel.classList.remove("has-error"); }
    if (!timeStr){ timeSel.classList.add("has-error"); ok=false; } else { timeSel.classList.remove("has-error"); }
    if (!ok) return;

    const start_at = `${dateStr}T${timeStr}:00`;

    const btn = form.querySelector('button[type="submit"]');
    const prev = btn.innerHTML;
    btn.disabled=true; btn.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Booking...`;

    try{
      await apiRequest("POST","/reservations", {
        client_id: CLIENT_ID,
        barber_id,
        services,           // [1,2,3]
        start_at,
        notes: note || "—"
      });

      form.reset();
      updateTotal();       // limpia totales
      await loadMyReservations();
      alert("Appointment booked!");
      setTab("appointments"); // mostrar lista tras reservar
    }catch(e){
      alert(e.message || "Failed to book appointment.");
    }finally{
      btn.disabled=false; btn.innerHTML=prev;
    }
  });

  filterDate?.addEventListener("change", applyResFilter);
  filterStatus?.addEventListener("change", applyResFilter);
  btnReload?.addEventListener("click", loadMyReservations);

  // ===== Initial load =====
  setTab("services");
  await Promise.all([ loadServices(), loadBarbers() ]);
  paintServicesCatalog(servicesAll);
  paintPicker(servicesAll);
  await loadMyReservations();
}
