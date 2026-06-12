const cities = [
  { name: 'Calama', latitude: -22.4567, longitude: -68.9237 },
  { name: 'Antofagasta', latitude: -23.6509, longitude: -70.3975 },
  { name: 'Santiago', latitude: -33.4489, longitude: -70.6693 },
];

const els = {
  weatherGrid: document.getElementById('weatherGrid'),
  dollarCard: document.getElementById('dollarCard'),
  holidaysCard: document.getElementById('holidaysCard'),
  updatedAt: document.getElementById('updatedAt'),
  reloadBtn: document.getElementById('reloadBtn'),
  themeToggle: document.querySelector('[data-theme-toggle]'),
};

const weatherCodeMap = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla escarchada', 51: 'Llovizna ligera', 53: 'Llovizna moderada',
  55: 'Llovizna intensa', 61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  71: 'Nieve ligera', 73: 'Nieve moderada', 75: 'Nieve intensa', 80: 'Chubascos ligeros',
  81: 'Chubascos moderados', 82: 'Chubascos intensos', 95: 'Tormenta'
};

function formatDate(value) {
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

function setUpdatedAt() {
  els.updatedAt.textContent = formatDate(Date.now());
}

function renderWeatherCard(city, current) {
  const condition = weatherCodeMap[current.weather_code] || 'Condición no disponible';
  return `
    <article class="weather-card">
      <div class="badge">📍 ${city.name}</div>
      <div class="temp">${Math.round(current.temperature_2m)}°C</div>
      <div class="details">
        <span><strong>Estado:</strong> ${condition}</span>
        <span><strong>Viento:</strong> ${current.wind_speed_10m} km/h</span>
        <span><strong>Hora API:</strong> ${formatDate(current.time)}</span>
      </div>
    </article>
  `;
}

async function loadWeather() {
  els.weatherGrid.innerHTML = '<div class="card loading">Cargando clima...</div>';
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
    els.weatherGrid.innerHTML = results.map(({ city, current }) => renderWeatherCard(city, current)).join('');
  } catch (error) {
    els.weatherGrid.innerHTML = `<div class="card error">No se pudo cargar el clima. ${error.message}</div>`;
  }
}

async function loadDollar() {
  els.dollarCard.className = 'metric-body loading';
  els.dollarCard.textContent = 'Cargando indicador económico...';
  try {
    const res = await fetch('https://mindicador.cl/api/dolar');
    if (!res.ok) throw new Error('Respuesta inválida del servicio económico');
    const data = await res.json();
    const latest = data.serie?.[0];
    if (!latest) throw new Error('Sin datos del dólar');

    els.dollarCard.className = 'metric-body';
    els.dollarCard.innerHTML = `
      <div class="metric-value">$${Number(latest.valor).toLocaleString('es-CL')}</div>
      <div><strong>Fecha del indicador:</strong> ${formatDate(latest.fecha)}</div>
      <div class="success">Datos obtenidos en formato JSON correctamente.</div>
    `;
  } catch (error) {
    els.dollarCard.className = 'metric-body error';
    els.dollarCard.textContent = `No se pudo cargar el dólar. ${error.message}`;
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
    const today = new Date();
    const upcoming = data
      .filter(item => new Date(item.date) >= new Date(today.toISOString().slice(0,10)))
      .slice(0, 4);

    if (!upcoming.length) throw new Error('No hay feriados próximos');

    els.holidaysCard.className = 'metric-body';
    els.holidaysCard.innerHTML = `
      <ul class="list-clean">
        ${upcoming.map(item => `<li><strong>${item.localName}</strong><br><span class="details">${new Date(item.date + 'T00:00:00').toLocaleDateString('es-CL')}</span></li>`).join('')}
      </ul>
    `;
  } catch (error) {
    els.holidaysCard.className = 'metric-body error';
    els.holidaysCard.textContent = `No se pudieron cargar los feriados. ${error.message}`;
  }
}

async function loadAll() {
  els.reloadBtn.disabled = true;
  els.reloadBtn.textContent = 'Actualizando...';
  await Promise.allSettled([loadWeather(), loadDollar(), loadHolidays()]);
  setUpdatedAt();
  els.reloadBtn.disabled = false;
  els.reloadBtn.textContent = 'Actualizar datos';
}

(function initTheme(){
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  els.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  els.themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    els.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
})();

els.reloadBtn.addEventListener('click', loadAll);
loadAll();