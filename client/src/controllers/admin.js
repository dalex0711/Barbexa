import { apiRequest } from "../api/request.js";
import {logoutUser} from '../services/auth.js'


const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[s]));

// Normalize API responses
function normUsers(raw){
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.users)) return raw.users;
  if (Array.isArray(raw?.data))  return raw.data;
  return [];
}
function normServices(raw){
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.services)) return raw.services;
  if (Array.isArray(raw?.data))     return raw.data;
  return [];
}

// Debounce
function debounce(fn, ms=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

// Toasts (auto-hide 3s)
function toast(msg, type='success'){
  let wrap = $('.toast-wrap'); if (!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div'); el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${type==='success'?'fa-circle-check':'fa-circle-exclamation'}"></i><span>${escapeHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-6px)'; setTimeout(()=>el.remove(), 180); }, 3000);
}


   //VIEWS


/* ---------- Dashboard (fake KPIs) ---------- */
async function renderDashboard(container){
  container.innerHTML = `
    <section class="card">
      <header>Dashboard</header>
      <div class="body">
        <div style="display:grid;grid-template-columns:repeat(3, minmax(0,1fr));gap:16px;">
          <div class="card" style="margin:0;">
            <header>Total month</header>
            <div class="body"><h2 id="kpiTotal" style="margin:0;color:var(--brand)">$0</h2><small class="muted">Simulated</small></div>
          </div>
          <div class="card" style="margin:0;">
            <header>Users</header>
            <div class="body"><h2 id="kpiUsers" style="margin:0">$0</h2></div>
          </div>
          <div class="card" style="margin:0;">
            <header>Completed appointments</header>
            <div class="body"><h2 id="kpiDone" style="margin:0">$0</h2><small class="muted">Fake for now</small></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Fetch data to compute fake numbers
  let users=[], barbers=[], services=[];
  try { users    = normUsers(await apiRequest("GET", "/users")); } catch {}
  try { barbers  = (await apiRequest("GET", "/barberUser"))?.barberUser || []; } catch {}
  try { services = normServices(await apiRequest("GET", "/services")); } catch {}

 
  const nUsers    = users.length;
  const nBarbers  = barbers.length;
  const nServices = services.length;

  const totalMonth = (nServices * 80000) + (nBarbers * 250000) + (nUsers * 12000);
  const completed  = Math.max(5, Math.round(nBarbers * 7 + nServices * 0.5));

  $("#kpiTotal").textContent   = `$${totalMonth.toLocaleString()}`;
  $("#kpiUsers").textContent   = nUsers;
  $("#kpiDone").textContent    = completed;
}

/* ---------- Manage (Create + Assign) ---------- */
function renderManage(container){
  container.innerHTML = `
    <div class="grid" style="display:grid; grid-template-columns:1fr 1fr; gap:22px;">
      <!-- Create Barber -->
      <section class="card">
        <header>Create Barber</header>
        <div class="body">
          <form id="formBarber" class="form" novalidate>
            <div class="field">
              <label class="label" for="b_username">Username</label>
              <input id="b_username" class="input" type="text" placeholder="jbarber" required />
              <small class="error"></small>
            </div>
            <div class="field">
              <label class="label" for="b_email">Email</label>
              <input id="b_email" class="input" type="email" placeholder="barber@example.com" required />
              <small class="error"></small>
            </div>
            <div class="field">
              <label class="label" for="b_password">Password</label>
              <input id="b_password" class="input" type="password" placeholder="••••••••" required />
              <small class="error"></small>
            </div>
            <div class="actions">
              <button type="submit" class="btn primary"><i class="fa-solid fa-floppy-disk"></i> Save Barber</button>
            </div>
          </form>
        </div>
      </section>

      <!-- Create Service -->
      <section class="card">
        <header>Create Service</header>
        <div class="body">
          <form id="formService" class="form" novalidate>
            <div class="field">
              <label class="label" for="s_name">Name</label>
              <input id="s_name" class="input" type="text" placeholder="Haircut" required />
              <small class="error"></small>
            </div>
            <div class="field">
              <label class="label" for="s_price">Price</label>
              <input id="s_price" class="input" type="number" step="0.01" placeholder="20000" required />
              <small class="error"></small>
            </div>
            <div class="field">
              <label class="label" for="s_duration">Duration (HH:MM)</label>
              <input id="s_duration" class="input" type="time" step="60" required />
              <small class="error"></small>
            </div>
            <div class="field">
              <label class="label" for="s_description">Description</label>
              <input id="s_description" class="input" type="text" placeholder="Basic haircut" required />
              <small class="error"></small>
            </div>
            <div class="actions">
              <button type="submit" class="btn primary"><i class="fa-solid fa-floppy-disk"></i> Save Service</button>
            </div>
          </form>
        </div>
      </section>
    </div>

    <!-- Assign Services to Barber -->
    <section class="card" style="margin-top:22px;">
      <header>Assign Services to Barber</header>
      <div class="body">
        <div class="form">
          <div class="field">
            <label class="label" for="as_barber">Barber</label>
            <select id="as_barber" class="select"></select>
            <small class="error" id="err_as_barber"></small>
          </div>

          <div class="field">
            <label class="label">Services</label>
            <div id="as_services_group" class="list"></div>
            <small class="error" id="err_as_services"></small>
          </div>

          <div class="actions">
            <button id="assignBtn" class="btn primary"><i class="fa-solid fa-link"></i> Assign</button>
          </div>
        </div>
      </div>
    </section>
  `;

  /* Create Barber */
  const formBarber = $("#formBarber", container);
  formBarber?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const username = $("#b_username").value.trim();
    const email    = $("#b_email").value.trim();
    const password = $("#b_password").value;

    const btn = formBarber.querySelector('button[type="submit"]');
    const prev = btn.textContent; btn.disabled = true; btn.textContent = "Saving...";
    try{
      await apiRequest("POST", "/register", { username, email, password, code_name: "BARBER_02" });
      toast("Barber created", "success");
      formBarber.reset();
      await loadAssignData(container); // refresh select if needed
    }catch(err){
      toast(err.message || "Failed to create barber", "error");
    }finally{
      btn.disabled = false; btn.textContent = prev;
    }
  });

  /* Create Service */
  const formService = $("#formService", container);
  formService?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name  = $("#s_name").value.trim();
    const price = Number($("#s_price").value);
    const hhmm  = $("#s_duration").value; // HH:MM
    const desc  = $("#s_description").value.trim();
    const duration = hhmm ? `${hhmm}:00` : "00:00:00";

    const btn = formService.querySelector('button[type="submit"]');
    const prev = btn.textContent; btn.disabled = true; btn.textContent = "Saving...";
    try{
      await apiRequest("POST", "/services", { name, price, duration, description: desc });
      toast("Service created", "success");
      formService.reset();
      await loadAssignData(container); // refresh services list
    }catch(err){
      toast(err.message || "Failed to create service", "error");
    }finally{
      btn.disabled = false; btn.textContent = prev;
    }
  });

  // Load barber+services for assignment
  loadAssignData(container);
// Assign button
$("#assignBtn", container)?.addEventListener("click", async ()=>{
  const barberId = $("#as_barber", container)?.value || "";
  if (!barberId){
    $("#err_as_barber").textContent = "Select a barber.";
    return;
  }

 // 1) Convert to numbers
  const selected = $$('#as_services_group input[type="checkbox"]:checked', container)
                    .map(c => Number(c.value))
                    .filter(n => Number.isFinite(n));

  if (!selected.length){
    $("#err_as_services").textContent = "Select at least one service.";
    return;
  }

  $("#err_as_barber").textContent = "";
  $("#err_as_services").textContent = "";

  const btn = $("#assignBtn", container);
  const prev = btn.textContent; 
  btn.disabled = true; 
  btn.textContent = "Assigning...";

 // Assign button
try {
  const payload = { services: selected }; 
  await apiRequest("POST", `/barbers/${barberId}/services`, payload);
  toast("Services assigned", "success");


  $("#as_barber", container).value = ""; // reset select
  $$('#as_services_group input[type="checkbox"]', container)
    .forEach(c => c.checked = false);   
} catch (err) {
  toast(err.message || "Failed to assign", "error");
} finally {
  btn.disabled = false;
  btn.textContent = prev;
}
});
}
async function loadAssignData(container){
  // Barbers
  const sel = $("#as_barber", container);
  try{
    const data = await apiRequest("GET", "/barberUser");
    const barbers = Array.isArray(data?.barberUser) ? data.barberUser : [];
    sel.innerHTML = `<option value="">Select a barber…</option>`;
    barbers.forEach(b=>{
      const opt = document.createElement("option");
      opt.value = b.id; opt.textContent = b.username;
      sel.appendChild(opt);
    });
  }catch{}

  // Services
  const group = $("#as_services_group", container);
  try{
    const raw = await apiRequest("GET", "/services");
    const arr = normServices(raw);
    group.innerHTML = "";
    arr.forEach(s=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <input type="checkbox" id="svc_${s.id}" value="${s.id}">
        <label for="svc_${s.id}">
          <strong>${escapeHtml(s.name || "Service")}</strong>
          <small class="muted"> — ${s.duration||s.s_duration||"00:00:00"} · $${Number(s.price||0).toLocaleString()}</small>
        </label>
      `;
      group.appendChild(div);
    });
  }catch{}
}

/* ---------- Users ---------- */
async function renderUsers(container){
  container.innerHTML = `
    <section class="card">
      <header>Users</header>
      <div class="body">
        <div class="table-tools">
          <div class="tool-left"><input id="searchUsers" class="input search" type="text" placeholder="Search by username or email..."></div>
          <div class="tool-right"><span id="usersCount" class="muted">0 users</span></div>
        </div>
        <table class="table" id="usersTable">
          <thead><tr><th>ID</th><th>Username</th><th>Email</th><th style="text-align:center;">Actions</th></tr></thead>
          <tbody></tbody>
        </table>
        <div id="usersEmpty" class="empty hidden">No users found.</div>
      </div>
    </section>
  `;

  const tbody   = container.querySelector("#usersTable tbody");
  const empty   = container.querySelector("#usersEmpty");
  const search  = container.querySelector("#searchUsers");
  const counter = container.querySelector("#usersCount");

  let all = [], view = [];

  function paint(list){
    tbody.innerHTML = "";
    if (!list.length){
      empty.classList.remove("hidden");
      counter.textContent = "0 users";
      return;
    }
    empty.classList.add("hidden");
    counter.textContent = `${list.length} user${list.length===1?"":"s"}`;

    list.forEach(u=>{
      const id = u.id ?? "";
      const username = u.username ?? "(no name)";
      const email = u.email ?? "(no email)";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(username)}</td>
        <td>${escapeHtml(email)}</td>
        <td class="actions-cell">
          <button class="action-btn edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;

      tr.querySelector(".edit").addEventListener("click", async ()=>{
        const newName  = prompt("New username:", username); if (newName==null) return;
        const newEmail = prompt("New email:", email);       if (newEmail==null) return;
        try{
          await apiRequest("PUT", `/users/${id}`, { username:newName.trim(), email:newEmail.trim() });
          u.username = newName.trim(); u.email = newEmail.trim();
          paint(view);
          toast("User updated", "success");
        }catch{ toast("Update failed", "error"); }
      });

      tr.querySelector(".delete").addEventListener("click", async ()=>{
        if (!confirm(`Delete ${username}?`)) return;
        try{
          await apiRequest("DELETE", `/users/${id}`);
          all = all.filter(x => x.id !== id);
          applyFilter(search.value);
          toast("User deleted", "success");
        }catch{ toast("Delete failed", "error"); }
      });

      tbody.appendChild(tr);
    });
  }

  function applyFilter(q){
    const t = (q||"").toLowerCase().trim();
    if (!t) view = [...all];
    else view = all.filter(u=>{
      const uName = (u.username ?? "").toLowerCase();
      const mail  = (u.email ?? "").toLowerCase();
      return uName.includes(t) || mail.includes(t);
    });
    paint(view);
  }

  const onSearch = debounce(e => applyFilter(e.target.value), 200);
  search.addEventListener("input", onSearch);

  try{
    const resp = await apiRequest("GET", "/users");
    all = Array.isArray(resp?.users) ? resp.users : [];
  }catch{
    all = [];
  }

  applyFilter("");
}

/* ---------- Services ---------- */
async function renderServices(container){
  container.innerHTML = `
    <section class="card">
      <header>Services</header>
      <div class="body">
        <div class="table-tools">
          <div class="tool-left"><input id="searchServices" class="input search" type="text" placeholder="Search by name..."></div>
          <div class="tool-right"><span id="servicesCount" class="muted">0 services</span></div>
        </div>

        <table class="table" id="servicesTable">
          <thead><tr><th style="width:80px;">ID</th><th>Name</th><th>Duration</th><th>Price</th><th style="width:130px; text-align:center;">Actions</th></tr></thead>
          <tbody></tbody>
        </table>

        <div id="servicesEmpty" class="empty hidden">No services found.</div>
      </div>
    </section>
  `;

  const tbody   = $("#servicesTable tbody", container);
  const empty   = $("#servicesEmpty", container);
  const search  = $("#searchServices", container);
  const counter = $("#servicesCount", container);

  let all = [], view = [];

  function paint(list){
    tbody.innerHTML = "";
    if (!list.length){
      empty.classList.remove("hidden"); counter.textContent = "0 services"; return;
    }
    empty.classList.add("hidden");
    counter.textContent = `${list.length} service${list.length===1?"":"s"}`;

    list.forEach(s=>{
      const id   = s.id ?? s.service_id ?? "";
      const name = s.name ?? "(no name)";
      const dur  = s.duration || s.s_duration || "00:00:00";
      const price= Number(s.price||0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(name)}</td>
        <td>${dur}</td>
        <td>$${price.toLocaleString()}</td>
        <td class="actions-cell">
          <button class="action-btn edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;

      tr.querySelector(".edit").addEventListener("click", async ()=>{
        const newName = prompt("New name:", name); if (newName==null) return;
        const newPriceStr = prompt("New price:", String(price)); if (newPriceStr==null) return;
        const newHHMM = prompt("New duration (HH:MM):", dur.slice(0,5)); if (newHHMM==null) return;

        const newPrice = Number(newPriceStr);
        const newDur   = newHHMM ? `${newHHMM}:00` : dur;

        try{
          await apiRequest("PUT", `/services/${id}`, { name:newName.trim(), price:newPrice, duration:newDur });
          s.name = newName.trim(); s.price = newPrice; s.duration = newDur;
          paint(view);
          toast("Service updated", "success");
        }catch{ toast("Update failed", "error"); }
      });

      tr.querySelector(".delete").addEventListener("click", async ()=>{
        if (!confirm(`Delete service "${name}"?`)) return;
        try{
          await apiRequest("DELETE", `/services/${id}`);
          all = all.filter(x => (x.id ?? x.service_id) !== id);
          applyFilter(search.value);
          toast("Service deleted", "success");
        }catch{ toast("Delete failed", "error"); }
      });

      tbody.appendChild(tr);
    });
  }

  function applyFilter(q){
    const t = (q||"").toLowerCase().trim();
    if (!t) view = [...all];
    else view = all.filter(s => (s.name ?? "").toLowerCase().includes(t));
    paint(view);
  }

  const onSearch = debounce(e => applyFilter(e.target.value), 200);
  search.addEventListener("input", onSearch);

  try{
    const raw = await apiRequest("GET", "/services");
    all = normServices(raw);
  }catch{ all = []; }
  applyFilter("");
}

/* =========================================
   Router (no URL change)
========================================= */
function setActive(view){
  $$("#sideNav a").forEach(a => a.classList.toggle("active", a.dataset.view === view));
}
function render(view){
  const container = $("#viewContainer");
  if (!container) return;
  setActive(view);
  // 👇 Ajustados a las vistas reales
  if (view === "users")    return renderUsers(container);
  if (view === "services") return renderServices(container);
  if (view === "manage")   return renderManage(container);
  return renderDashboard(container);
}

function wireLogout(){
  const btn = document.getElementById("btnLogout");
  if (!btn) return;
  btn.addEventListener("click", async ()=>{
    btn.disabled = true;
    const prev = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging out...`;
       try{
      await logoutUser();
      window.location.href = "/login";
    }catch(err){
      alert("Logout failed");
    }
  });
}
export function init(){
  $("#sideNav")?.addEventListener("click", (e)=>{
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    e.preventDefault();
    render(a.dataset.view || "dashboard");
  });
  // initial view
  render("dashboard");
  wireLogout();
}



