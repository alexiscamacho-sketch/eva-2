const firebaseConfig = {
  apiKey: "AIzaSyCKaD9mW61QwPGiXd2Zu9bQfMjQFFuebnQ",
  authDomain: "tortasdemama-fbbe7.firebaseapp.com",
  projectId: "tortasdemama-fbbe7",
  storageBucket: "tortasdemama-fbbe7.firebasestorage.app",
  messagingSenderId: "864798686646",
  appId: "1:864798686646:web:c909b20bc08512414d1517"
};

const els = {
  weatherGrid: document.getElementById('weatherGrid'),
  dollarCard: document.getElementById('dollarCard'),
  holidaysCard: document.getElementById('holidaysCard'),
  updatedAt: document.getElementById('updatedAt'),
  reloadBtn: document.getElementById('reloadBtn'),
  cakeModal: document.getElementById('cakeModal'),
  openCakeModal: document.getElementById('openCakeModal'),
  closeCakeModal: document.getElementById('closeCakeModal'),
  copyCakeOrder: document.getElementById('copyCakeOrder'),
  sendCakeWhatsapp: document.getElementById('sendCakeWhatsapp'),
  cakeFormStatus: document.getElementById('cakeFormStatus'),
  clienteNombre: document.getElementById('clienteNombre'),
  clienteTelefono: document.getElementById('clienteTelefono'),
  pedidoSabor: document.getElementById('pedidoSabor'),
  pedidoTipo: document.getElementById('pedidoTipo'),
  pedidoFecha: document.getElementById('pedidoFecha'),
  pedidoPersonas: document.getElementById('pedidoPersonas'),
  pedidoDetalle: document.getElementById('pedidoDetalle')
};

const cities = [
  { name: 'Calama', latitude: -22.4567, longitude: -68.9237 },
  { name: 'Antofagasta', latitude: -23.6509, longitude: -70.3975 },
  { name: 'Santiago', latitude: -33.4489, longitude: -70.6693 }
];

const weatherCodeMap = { 0:'Despejado', 1:'Mayormente despejado', 2:'Parcialmente nublado', 3:'Nublado', 45:'Niebla', 48:'Niebla escarchada', 51:'Llovizna ligera', 53:'Llovizna moderada', 55:'Llovizna intensa', 61:'Lluvia ligera', 63:'Lluvia moderada', 65:'Lluvia intensa', 71:'Nieve ligera', 73:'Nieve moderada', 75:'Nieve intensa', 80:'Chubascos ligeros', 81:'Chubascos moderados', 82:'Chubascos intensos', 95:'Tormenta' };

function formatDate(value) { return new Date(value).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }); }
function formatMoney(value) { return Number(value || 0).toLocaleString('es-CL'); }
function setStatus(message, ok = true) { if (!els.cakeFormStatus) return; els.cakeFormStatus.textContent = message; els.cakeFormStatus.style.color = ok ? '#6B3A2A' : '#B42318'; }

function buildCakeSummary() {
  const nombre = els.clienteNombre.value.trim();
  const telefono = els.clienteTelefono.value.trim();
  const sabor = els.pedidoSabor.value;
  const tipo = els.pedidoTipo.value;
  const fecha = els.pedidoFecha.value;
  const personas = els.pedidoPersonas.value;
  const detalle = els.pedidoDetalle.value.trim();
  if (!nombre || !telefono || !sabor || !tipo || !fecha || !personas) return null;
  return ['Hola, quiero hacer un pedido en La Torta de Mamá:', '', `Nombre: ${nombre}`, `Teléfono: ${telefono}`, `Sabor: ${sabor}`, `Tipo: ${tipo}`, `Fecha de entrega: ${fecha}`, `Cantidad de personas: ${personas}`, `Detalles: ${detalle || 'Sin detalles adicionales'}`].join('\n');
}

function renderWeatherCard(city, current) {
  const condition = weatherCodeMap[current.weather_code] || 'Condición no disponible';
  return `
    <article class="weather-card">
      <div class="weather-city">📍 ${city.name}</div>
      <div class="temp">${Math.round(current.temperature_2m)}°C</div>
      <div class="details">
        <span><strong>Estado:</strong> ${condition}</span>
        <span><strong>Viento:</strong> ${current.wind_speed_10m} km/h</span>
        <span><strong>Hora API:</strong> ${formatDate(current.time)}</span>
      </div>
    </article>`;
}

async function loadWeather() {
  els.weatherGrid.innerHTML = '<div class="weather-card loading">Cargando clima...</div>';
  try {
    const requests = cities.map(city => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
      return fetch(url).then(async res => {
        if (!res.ok) throw new Error(`Clima no disponible para ${city.name}`);
        const data = await res.json();
        return { city, current: data.current };
      });
    });
    const results = await Promise.all(requests);
    els.weatherGrid.innerHTML = results.map(item => renderWeatherCard(item.city, item.current)).join('');
  } catch (error) {
    els.weatherGrid.innerHTML = `<div class="weather-card error">No se pudo cargar el clima. ${error.message}</div>`;
  }
}

async function loadDollar() {
  els.dollarCard.className = 'metric-body loading';
  els.dollarCard.innerHTML = 'Cargando indicador económico...';
  try {
    const res = await fetch('https://mindicador.cl/api/dolar');
    if (!res.ok) throw new Error('Respuesta inválida del servicio económico');
    const data = await res.json();
    const latest = data.serie?.[0];
    if (!latest) throw new Error('Sin datos del dólar');
    els.dollarCard.className = 'metric-body';
    els.dollarCard.innerHTML = `<div class="metric-value">$${formatMoney(latest.valor)}</div><div class="details"><span><strong>Fecha del indicador:</strong> ${formatDate(latest.fecha)}</span><span class="success">Datos cargados correctamente.</span></div>`;
  } catch (error) {
    els.dollarCard.className = 'metric-body error';
    els.dollarCard.innerHTML = `<div>No se pudo cargar el dólar automáticamente.</div><div class="details"><span>Motivo: ${error.message}</span></div>`;
  }
}

async function loadHolidays() {
  els.holidaysCard.className = 'metric-body loading';
  els.holidaysCard.textContent = 'Cargando feriados...';
  try {
    const year = new Date().getFullYear();
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/CL`);
    if (!res.ok) throw new Error('Respuesta inválida del servicio de feriados');
    const data = await res.json();
    const baseDate = new Date(new Date().toISOString().slice(0, 10));
    const upcoming = data.filter(item => new Date(item.date + 'T00:00:00') >= baseDate).slice(0, 4);
    if (!upcoming.length) throw new Error('No hay feriados próximos');
    els.holidaysCard.className = 'metric-body';
    els.holidaysCard.innerHTML = `<ul class="list-clean">${upcoming.map(item => `<li><strong>${item.localName}</strong><br><span class="details">${new Date(item.date + 'T00:00:00').toLocaleDateString('es-CL')}</span></li>`).join('')}</ul>`;
  } catch (error) {
    els.holidaysCard.className = 'metric-body error';
    els.holidaysCard.textContent = `No se pudieron cargar los feriados. ${error.message}`;
  }
}

async function loadAll() {
  els.reloadBtn.disabled = true;
  els.reloadBtn.textContent = 'Actualizando...';
  await Promise.allSettled([loadWeather(), loadDollar(), loadHolidays()]);
  els.updatedAt.textContent = formatDate(Date.now());
  els.reloadBtn.disabled = false;
  els.reloadBtn.textContent = 'Actualizar datos';
}

function initCakeModal() {
  els.openCakeModal?.addEventListener('click', () => { els.cakeModal.showModal(); setStatus(''); });
  els.closeCakeModal?.addEventListener('click', () => els.cakeModal.close());
  els.copyCakeOrder?.addEventListener('click', async () => {
    const summary = buildCakeSummary();
    if (!summary) return setStatus('Completa nombre, teléfono, sabor, tipo, fecha y cantidad antes de copiar.', false);
    try { await navigator.clipboard.writeText(summary); setStatus('Resumen copiado. Ya puedes pegarlo en WhatsApp o Telegram.'); }
    catch { setStatus('No se pudo copiar automáticamente. Revisa permisos del navegador.', false); }
  });
  els.sendCakeWhatsapp?.addEventListener('click', () => {
    const summary = buildCakeSummary();
    if (!summary) return setStatus('Completa los campos obligatorios antes de enviar.', false);
    const whatsappUrl = `https://wa.me/56975519080?text=${encodeURIComponent(summary)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);
    provider.setCustomParameters({ prompt: 'select_account' });

    const googleBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authMessage = document.getElementById('authMessage');
    const userStatus = document.getElementById('userStatus');
    const sidebarAuthStatus = document.getElementById('sidebarAuthStatus');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const orderForm = document.getElementById('orderForm');
    const orderMessage = document.getElementById('orderMessage');
    const orderType = document.getElementById('orderType');
    const customerName = document.getElementById('customerName');
    const deliveryDate = document.getElementById('deliveryDate');
    const orderStatus = document.getElementById('orderStatus');
    const orderPrice = document.getElementById('orderPrice');
    const orderAdvance = document.getElementById('orderAdvance');
    const orderDetails = document.getElementById('orderDetails');
    const ordersList = document.getElementById('ordersList');
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    const metricOrders = document.getElementById('metricOrders');
    const metricSales = document.getElementById('metricSales');
    const metricBalance = document.getElementById('metricBalance');
    const collectionRef = collection(db, 'orders');
    let currentUser = null;

    function getBalance(price, advance) { return Math.max(Number(price || 0) - Number(advance || 0), 0); }
    function updateMetrics(items) { metricOrders.textContent = String(items.length); metricSales.textContent = '$' + formatMoney(items.reduce((sum, item) => sum + Number(item.price || 0), 0)); metricBalance.textContent = '$' + formatMoney(items.reduce((sum, item) => sum + getBalance(item.price, item.advance), 0)); }
    function getStatusClass(status) { const n = String(status || '').toLowerCase(); if (n.includes('entregado')) return 'status-delivered'; if (n.includes('listo')) return 'status-ready'; if (n.includes('prepar')) return 'status-progress'; if (n.includes('confirm')) return 'status-confirmed'; return 'status-pending'; }

    function renderOrders(items) {
      if (!items.length) { ordersList.innerHTML = '<p class="helper-text">No hay pedidos guardados todavía para este usuario.</p>'; updateMetrics([]); return; }
      ordersList.innerHTML = items.map(item => `<article class="saved-order"><div class="saved-order-top"><span class="hero-badge">${item.type}</span><span class="status-badge ${getStatusClass(item.status)}">${item.status || 'pendiente'}</span></div><h3>${item.customerName}</h3><p>${item.details}</p><div class="order-finance-grid"><div><strong>Entrega:</strong><br>${item.deliveryDate || 'Sin fecha'}</div><div><strong>Precio:</strong><br>$${formatMoney(item.price || 0)}</div><div><strong>Abono:</strong><br>$${formatMoney(item.advance || 0)}</div><div><strong>Saldo:</strong><br>$${formatMoney(getBalance(item.price, item.advance))}</div></div></article>`).join('');
      updateMetrics(items);
    }

    async function loadOrders() {
      if (!currentUser) { renderOrders([]); orderMessage.textContent = 'Inicia sesión para ver y guardar pedidos.'; return; }
      ordersList.innerHTML = '<p class="helper-text">Cargando pedidos...</p>';
      try {
        const q = query(collectionRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(items);
        orderMessage.textContent = 'Pedidos cargados correctamente.';
      } catch (error) {
        ordersList.innerHTML = '<p class="helper-text">No se pudieron cargar los pedidos.</p>';
        orderMessage.textContent = 'Error al cargar pedidos: ' + error.message;
      }
    }

    async function saveOrder(event) {
      event.preventDefault();
      if (!currentUser) { orderMessage.textContent = 'Debes iniciar sesión antes de guardar un pedido.'; return; }
      const payload = { userId: currentUser.uid, userEmail: currentUser.email || '', type: orderType.value, customerName: customerName.value.trim(), deliveryDate: deliveryDate.value, status: orderStatus.value, price: Number(orderPrice.value || 0), advance: Number(orderAdvance.value || 0), details: orderDetails.value.trim(), createdAt: serverTimestamp() };
      if (!payload.type || !payload.customerName || !payload.deliveryDate || !payload.status || !payload.details) { orderMessage.textContent = 'Completa todos los campos obligatorios del pedido.'; return; }
      if (payload.price <= 0) { orderMessage.textContent = 'El precio total debe ser mayor que 0.'; return; }
      if (payload.advance < 0 || payload.advance > payload.price) { orderMessage.textContent = 'El abono debe ser válido y no mayor al precio total.'; return; }
      try { await addDoc(collectionRef, payload); orderForm.reset(); orderStatus.value = 'pendiente'; orderMessage.textContent = 'Pedido guardado correctamente en tu cuenta.'; await loadOrders(); document.querySelector('[data-view-target="panel"]')?.click(); }
      catch (error) { orderMessage.textContent = 'No se pudo guardar el pedido: ' + error.message; }
    }

    googleBtn?.addEventListener('click', async () => { try { await signInWithPopup(auth, provider); } catch (error) { authMessage.textContent = 'No se pudo iniciar sesión: ' + error.message; } });
    logoutBtn?.addEventListener('click', async () => { try { await signOut(auth); } catch (error) { authMessage.textContent = 'No se pudo cerrar sesión: ' + error.message; } });
    orderForm?.addEventListener('submit', saveOrder);
    refreshOrdersBtn?.addEventListener('click', loadOrders);

    onAuthStateChanged(auth, async (user) => {
      currentUser = user || null;
      if (user) {
        authMessage.textContent = 'Sesión activa con Google.';
        userStatus.textContent = 'Sesión iniciada correctamente.';
        sidebarAuthStatus.textContent = 'Sesión activa: ' + (user.displayName || user.email || 'usuario');
        userProfile.hidden = false;
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Usuario')}&background=C9566A&color=fff`;
        userName.textContent = user.displayName || 'Usuario';
        userEmail.textContent = user.email || 'Sin correo';
        logoutBtn.hidden = false;
        await loadOrders();
      } else {
        authMessage.textContent = 'Pega tus credenciales reales de Firebase para activar Google Login.';
        userStatus.textContent = 'No has iniciado sesión.';
        sidebarAuthStatus.textContent = 'No has iniciado sesión.';
        userProfile.hidden = true;
        logoutBtn.hidden = true;
        renderOrders([]);
      }
    });

    authMessage.textContent = 'Firebase conectado. Ya puedes iniciar sesión con Google.';
  } catch (error) {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) authMessage.textContent = 'Falta configurar Firebase o hubo un error: ' + error.message;
  }
}

function wireViews() {
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.viewTarget;
      document.querySelectorAll('[data-view-target]').forEach(b => b.classList.toggle('is-active', b.dataset.viewTarget === name));
      document.querySelectorAll('[data-view]').forEach(panel => panel.classList.toggle('is-visible', panel.dataset.view === name));
    });
  });
}

wireViews();
initCakeModal();
initFirebase();
loadAll();
