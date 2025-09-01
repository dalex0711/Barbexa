  // --- Elementos ---
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotBox = document.querySelector('.chatbot-box');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatbotInput = document.querySelector('.chatbot-input');
  const chatbotSend = document.querySelector('.chatbot-send');
  const messagesEl = document.querySelector('.chatbot-messages');
  const optionsEl = document.querySelector('.chatbot-options');
  const voiceBtn = document.querySelector('.chatbot-voice');

  // --- NAVBAR (menú hamburguesa) ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#mainNav');

  // Toggle menú hamburguesa
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !expanded);
      mainNav.hidden = expanded;
    });
  }

  // Manejar enlaces del menú
  const navLinks = mainNav.querySelectorAll('a');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Enlaces internos (scroll)
      if (href.startsWith('#')) {
        e.preventDefault(); 
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Cerrar menú solo si es pantalla pequeña (hamburguesa visible)
      if (window.getComputedStyle(menuToggle).display !== 'none') {
        mainNav.hidden = true;
        menuToggle.setAttribute("aria-expanded", false);
      }
    });
  });

  // Opcional: manejar resize para mostrar siempre menú en pantalla grande
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { // ejemplo breakpoint
      mainNav.hidden = false;
      menuToggle.setAttribute("aria-expanded", false);
    } else {
      mainNav.hidden = true;
    }
  });

  let waitingForFaceType = false;
  let awaitingBooking = false;
  let recognition; // speech recognition instance (if supported)

  // --- Quick options ---
  const quickOptions = [
    { text: "Haircut recommendation", value: "corte" },
    { text: "View prices", value: "precios" },
    { text: "Opening hours", value: "horarios" },
    { text: "Location", value: "ubicacion" },
    { text: "Hair care tips", value: "tips" },
    { text: "Book appointment", value: "cita" }
  ];

  // --- Example images for haircuts ---
  const haircutImages = {
    pompadour: ["../../public/assets/img/cote.webp"],
    fade: ["../../public/assets/img/cote.webp"],
    quiff: ["../../public/assets/img/cote.webp"],
    buzz: ["../../public/assets/img/cote.webp"]
  };

  // --- Utilities: persist chat history ---
  const CHAT_KEY = "barbexa_chat_history_v1";
  function saveMessageToHistory(obj){
    try{
      const history = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
      history.push({ ...obj, t: Date.now() });
      localStorage.setItem(CHAT_KEY, JSON.stringify(history.slice(-200)));
    }catch(e){}
  }
  function loadHistory() {
    try {
      const history = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
      history.forEach(msg => appendMessage(msg.text, msg.sender, false));
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
  }

  // --- Append message ---
  function appendMessage(text, sender="bot", save=true){
    const el = document.createElement("div");
    el.className = `message ${sender === "user" ? "user" : "bot"}`;
    if(typeof text === "string") el.innerHTML = text;
    else el.appendChild(text);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    if(save) saveMessageToHistory({ text: (typeof text === "string"? text : el.innerText), sender });
  }

  // --- Show quick options ---
  function showOptions(){
    optionsEl.innerHTML = "";
    quickOptions.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "chatbot-option";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => handleOption(opt.value));
      optionsEl.appendChild(btn);
    });
    optionsEl.removeAttribute("hidden");
  }

  // --- Option handler ---
  function handleOption(value){
    appendMessage(getLabelByValue(value), "user");
    optionsEl.setAttribute("hidden", "");

    if(value === "corte"){
      appendMessage("Great! 😊 Tell me, how would you describe your face? (round, square, long, oval)", "bot");
      waitingForFaceType = true;
    } 
    else if(value === "tips"){
      appendMessage(getCareTips(), "bot");
      setTimeout(showOptions,700);
    } 
    else if(value === "cita"){
      appendMessage("Perfect 👍 I will take you to the login page to book your appointment.", "bot");
      setTimeout(()=> window.location.href="/login",1500);
    }
    else {
      appendMessage(getBotReply(value), "bot");
      setTimeout(showOptions,800);
    }
  }
  function getLabelByValue(v){ const o = quickOptions.find(x=>x.value===v); return o? o.text: v; }

  // --- Bot replies ---
  function getBotReply(value){
    if(value === "precios") return "Our prices: Haircut from <strong>$20.000</strong> | Beard <strong>$15.000</strong> | Full package <strong>$30.000</strong>.";
    if(value === "horarios") return "⏰ We are open Mon - Sat: 9:00 AM - 9:00 PM. Want to quickly book an appointment? Choose the <strong>Book appointment</strong> option.";
    if(value === "ubicacion") return "📍 We are at Cra. 15 #45-20, downtown Barranquilla. For more info, contact the WhatsApp at the bottom.";
    return "Sorry, I didn't understand your message.";
  }

  // --- Haircut recommendation ---
  function getHaircutRecommendation(faceType){
    const f = faceType.toLowerCase();
    if(f.includes("round")) return { text:"😀 For round face: volume on top and short sides — Pompadour or High Fade.", images: haircutImages.pompadour };
    if(f.includes("square")) return { text:"💪 Square face: texture on top — Crew Cut or Undercut.", images: haircutImages.fade };
    if(f.includes("long")) return { text:"👌 Long face: volume on the sides — Fringe or Classic cut.", images: haircutImages.quiff };
    if(f.includes("oval")) return { text:"🔥 Oval face: almost any haircut suits you. Try Buzz or Quiff.", images: haircutImages.buzz };
    return { text:"🤔 I don't recognize that face type. Try: round, square, long, or oval.", images: [] };
  }

  // --- User text ---
  function handleUserText(text){
    appendMessage(text, "user");

    // chatbot detecta cita
    if(/cita|agendar/i.test(text)){
      appendMessage("Perfect 👍 I will take you to the login page to book your appointment.", "bot");
      setTimeout(() => router.navigate('/login'), 1500); // tu función router
      return;
    }

    if(waitingForFaceType){
      const rec = getHaircutRecommendation(text);
      appendMessage(rec.text, "bot");
      if(rec.images && rec.images.length) showThumbs(rec.images);
      waitingForFaceType = false;
      return;
    }

    appendMessage("🤖 Hello, try selecting one of the menu options or type 'appointment' to book.", "bot");
    setTimeout(showOptions, 700);
  }

  // --- Thumbnails ---
  function showThumbs(urls){
    const container = document.createElement("div");
    container.className = "chat-thumb";
    urls.forEach(u=>{
      const img = document.createElement("img");
      img.src = u; img.alt="haircut"; img.loading="lazy";
      img.addEventListener("click", ()=> openImageModal(u));
      container.appendChild(img);
    });
    appendMessage(container,"bot");
  }

  // --- Modal image ---
  function openImageModal(src){
    const modal = document.createElement("div");
    modal.style="position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,0.85);z-index:2000;padding:20px";
    const img=document.createElement("img");
    img.src=src; img.style="max-width:95%;max-height:90%;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.6)";
    modal.appendChild(img);
    modal.addEventListener("click",()=> document.body.removeChild(modal));
    document.body.appendChild(modal);
  }

  // --- Care tips ---
  function getCareTips(){
    return `✨ <strong>Quick tips:</strong>
    <ul style="margin:6px 0 0 18px;color:#ddd">
      <li>Wash your hair with mild shampoo 2-3 times per week.</li>
      <li>Use beard oil daily if you have one.</li>
      <li>Trim ends every 6-8 weeks to maintain shape.</li>
    </ul>`;
  }

  // --- Voice recognition ---
  function initSpeechRecognition(){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = 'es-CO'; r.interimResults=false; r.maxAlternatives=1;
    r.onresult=(e)=>{ const text=e.results[0][0].transcript; handleUserText(text); };
    r.onerror=()=> appendMessage("I couldn't understand the voice, try typing.", "bot");
    return r;
  }

  //--- limpiar chat
  function clearChatHistory(){
    localStorage.removeItem(CHAT_KEY);
    messagesEl.innerHTML = "";
    appendMessage("🧹 History cleared.", "bot");
    showOptions();
  }

  // --- Abrir/cerrar chat ---
  function openChat() {
    chatbotBox.style.display = "flex";
    chatbotBox.classList.remove("chatbot-hide");
    chatbotBox.classList.add("chatbot-show");
    
    chatbotToggle.style.display = "none"; // ocultar botón al abrir
    chatbotBox.hidden = false;

    const history = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    if (history.length === 0) {
      appendMessage("👋 Hi, I'm your assistant ALEX. How can I help you today?", "bot");
      showOptions();
    } else {
      setTimeout(() => showOptions(), 400);
    }
  }

  function closeChat() {
    chatbotBox.classList.remove("chatbot-show");
    chatbotBox.classList.add("chatbot-hide");

    setTimeout(() => {
      chatbotBox.style.display = "none";
      chatbotBox.hidden = true;
      chatbotToggle.style.display = "block"; // volver a mostrar botón
    }, 300);

    // limpiar historial y mensajes
    localStorage.removeItem(CHAT_KEY);
    messagesEl.innerHTML = "";
  }

  // 👉 Botón flotante
  if(chatbotToggle) chatbotToggle.addEventListener("click", openChat);
  // 👉 Botón de cerrar
  if(chatbotClose) chatbotClose.addEventListener("click", closeChat);
  // 👉 Tecla ESC
  document.addEventListener("keydown", (e)=>{
    if(e.key==="Escape" && !chatbotBox.hidden){
      closeChat();
    }
  });

  // --- enviar mensaje ---
  if(chatbotSend){
    chatbotSend.addEventListener("click", ()=>{
      const text = chatbotInput.value.trim();
      if(!text) return;
      chatbotInput.value = "";
      handleUserText(text);
    });
  }
  if(chatbotInput){
    chatbotInput.addEventListener("keydown", (e)=>{
      if(e.key==="Enter"){ e.preventDefault(); chatbotSend.click(); }
    });
  }

  // --- voice button ---
  if(voiceBtn){
    voiceBtn.addEventListener("click", ()=>{
      if(!recognition){ recognition=initSpeechRecognition(); if(!recognition){ appendMessage("Your browser doesn't support voice recognition.", "bot"); return; } }
      try{ recognition.start(); appendMessage("🎤 Recording... speak now.", "bot"); }catch(e){ appendMessage("Couldn't start the microphone.", "bot"); }
    });
  }

  // --- Initial load ---
  loadHistory();
