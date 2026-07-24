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
  pedidoDetalle: document.getElementById('pedidoDetalle'),
  googleLoginBtn: document.getElementById('googleLoginBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  authMessage: document.getElementById('authMessage')
};

const cities = [
  { name: 'Calama', latitude: -22.4567, longitude: -68.9237 },
  { name: 'Antofagasta', latitude: -23.6509, longitude: -70.3975 },
  { name: 'Santiago', latitude: -33.4489, longitude: -70.6693 }
];

const weatherCodeMap = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla escarchada', 51: 'Llovizna ligera', 53: 'Llovizna moderada',
  55: 'Llovizna intensa', 61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  71: 'Nieve ligera', 73: 'Nieve moderada', 75: 'Nieve intensa', 80: 'Chubascos ligeros',
  81: 'Chubascos moderados', 82: 'Chubascos intensos', 95: 'Tormenta'
};

function formatDate(value) {
  return new Date(value).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-CL');
}

function setStatus(message, ok = true) {
  if (!els.cakeFormStatus) return;
  els.cakeFormStatus.textContent = message;
  els.cakeFormStatus.style.color = ok ? '#6B3A2A' : '#B42318';
}

function buildCakeSummary() {
  const nombre = els.clienteNombre?.value.trim();
  const telefono = els.clienteTelefono?.value.trim();
  const sabor = els.pedidoSabor?.value;
  const tipo = els.pedidoTipo?.value;
  const fecha = els.pedidoFecha?.value;
  const personas = els.pedidoPersonas?.value;
  const detalle = els.pedidoDetalle?.value.trim();

  if (!nombre || !telefono || !sabor || !tipo || !fecha || !personas) return null;

  return [
    'Hola, quiero hacer un pedido en La Torta de Mamá:',
    '',
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Sabor: ${sabor}`,
    `Tipo: ${tipo}`,
    `Fecha de entrega: ${fecha}`,
    `Cantidad de personas: ${personas}`,
    `Detalles: ${detalle || 'Sin detalles adicionales'}`
  ].join('\n');
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
  if (!els.weatherGrid) return;
  els.weatherGrid.innerHTML = '<div class="weather-card loading">Cargando clima...</div>';
  try {
    const requests = cities.map(async city => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Clima no disponible para ${city.name}`);
      const data = await res.json();
      return { city, current: data.current };
    });
    const results = await Promise.all(requests);
    els.weatherGrid.innerHTML = results.map(item => renderWeatherCard(item.city, item.current)).join('');
  } catch (error) {
    els.weatherGrid.innerHTML = `<div class="weather-card error">No se pudo cargar el clima. ${error.message}</div>`;
  }
}

async function loadDollar() {
  if (!els.dollarCard) return;
  els.dollarCard.className = 'metric-body loading';
  els.dollarCard.innerHTML = 'Cargando indicador económico...';
  try {
    const res = await fetch('https://mindicador.cl/api/dolar');
    if (!res.ok) throw new Error('Respuesta inválida del servicio económico');
    const data = await res.json();
    const latest = data.serie?.[0];
    if (!latest) throw new Error('Sin datos del dólar');
    els.dollarCard.className = 'metric-body';
    els.dollarCard.innerHTML = `
      <div class="metric-value">$${formatMoney(latest.valor)}</div>
      <div class="details">
        <span><strong>Fecha del indicador:</strong> ${formatDate(latest.fecha)}</span>
        <span class="success">Datos cargados correctamente.</span>
      </div>`;
  } catch (error) {
    els.dollarCard.className = 'metric-body error';
    els.dollarCard.innerHTML = `<div>No se pudo cargar el dólar automáticamente.</div><div class="details"><span>Motivo: ${error.message}</span></div>`;
  }
}

async function loadHolidays() {
  if (!els.holidaysCard) return;
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
    els.holidaysCard.innerHTML = `
      <ul class="list-clean">
        ${upcoming.map(item => `
          <li>
            <strong>${item.localName}</strong><br>
            <span class="details">${new Date(item.date + 'T00:00:00').toLocaleDateString('es-CL')}</span>
          </li>`).join('')}
      </ul>`;
  } catch (error) {
    els.holidaysCard.className = 'metric-body error';
    els.holidaysCard.textContent = `No se pudieron cargar los feriados. ${error.message}`;
  }
}

async function loadAll() {
  if (els.reloadBtn) {
    els.reloadBtn.disabled = true;
    els.reloadBtn.textContent = 'Actualizando...';
  }
  await Promise.allSettled([loadWeather(), loadDollar(), loadHolidays()]);
  if (els.updatedAt) els.updatedAt.textContent = formatDate(Date.now());
  if (els.reloadBtn) {
    els.reloadBtn.disabled = false;
    els.reloadBtn.textContent = 'Actualizar datos';
  }
}

function initCakeModal() {
  els.openCakeModal?.addEventListener('click', () => {
    els.cakeModal?.showModal();
    setStatus('');
  });

  els.closeCakeModal?.addEventListener('click', () => els.cakeModal?.close());

  els.copyCakeOrder?.addEventListener('click', async () => {
    const summary = buildCakeSummary();
    if (!summary) return setStatus('Completa nombre, teléfono, sabor, tipo, fecha y cantidad antes de copiar.', false);
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Resumen copiado. Ya puedes pegarlo en WhatsApp o Telegram.');
    } catch {
      setStatus('No se pudo copiar automáticamente. Revisa permisos del navegador.', false);
    }
  });

  els.sendCakeWhatsapp?.addEventListener('click', () => {
    const summary = buildCakeSummary();
    if (!summary) return setStatus('Completa los campos obligatorios antes de enviar.', false);
    window.open(`https://wa.me/56975519080?text=${encodeURIComponent(summary)}`, '_blank', 'noopener,noreferrer');
  });
}

async function initFirebase() {
  if (!els.googleLoginBtn || !els.logoutBtn || !els.authMessage) return;
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    els.googleLoginBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        els.authMessage.textContent = 'No se pudo iniciar sesión: ' + error.message;
      }
    });

    els.logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (error) {
        els.authMessage.textContent = 'No se pudo cerrar sesión: ' + error.message;
      }
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        els.authMessage.textContent = 'Sesión activa con Google: ' + (user.displayName || user.email || 'usuario');
        els.logoutBtn.hidden = false;
      } else {
        els.authMessage.textContent = 'Inicia sesión con Google para guardar pedidos.';
        els.logoutBtn.hidden = true;
      }
    });

    els.authMessage.textContent = 'Firebase listo. Ya puedes iniciar sesión con Google.';
  } catch (error) {
    els.authMessage.textContent = 'Falta configurar Firebase o hubo un error: ' + error.message;
  }
}

function wireEvents() {
  els.reloadBtn?.addEventListener('click', loadAll);
}

wireEvents();
initCakeModal();
initFirebase();
loadAll();
