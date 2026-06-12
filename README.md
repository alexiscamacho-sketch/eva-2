# Dashboard APIs Públicas Chile

Proyecto web estático para la evaluación práctica individual. Muestra datos en tiempo real desde 3 APIs públicas distintas:

1. Clima actual de Calama, Antofagasta y Santiago.
2. Valor del dólar observado en Chile.
3. Próximos feriados en Chile.

## APIs utilizadas

### 1) Clima
- API: Open-Meteo
- Endpoint base: `https://api.open-meteo.com/v1/forecast`
- Uso en el proyecto: clima actual por coordenadas geográficas.

### 2) Dólar
- API: mindicador.cl
- Endpoint usado: `https://mindicador.cl/api/dolar`
- Uso en el proyecto: consultar el valor actualizado del dólar observado.

### 3) Feriados
- API: Nager.Date Public Holidays
- Endpoint usado: `https://date.nager.at/api/v3/PublicHolidays/{year}/CL`
- Justificación: aporta valor práctico al usuario porque permite ver próximos feriados de Chile en la misma interfaz.

## Tecnologías
- HTML5
- CSS3
- JavaScript nativo

## Ejecución local

1. Descarga o clona este repositorio.
2. Abre la carpeta `evaluacion-2`.
3. Ejecuta un servidor local simple. Ejemplos:
   - Con VS Code: extensión Live Server.
   - Con Python:
     ```bash
     python -m http.server 5500
     ```
4. Abre en tu navegador:
   - `http://localhost:5500/dashboard.html`

## Despliegue

Se puede desplegar directamente en Netlify, Vercel o Render conectando el repositorio GitHub.

### En Netlify
1. Sube este proyecto a GitHub.
2. En Netlify selecciona **Add new site > Import an existing project**.
3. Conecta tu repositorio.
4. Define como carpeta publicada la carpeta `evaluacion-2` si tu repositorio tiene más contenido.
5. Publica el sitio.

## Requisitos cumplidos
- Consumo de API pública de clima.
- Consumo de API pública de dólar.
- Consumo de tercera API pública.
- Procesamiento JSON con `fetch()` y asincronía.
- Render dinámico en interfaz web.
- Hora visible de actualización.
- Estructura apta para primer despliegue.

## Estructura

```bash
/evaluacion-2
  ├── dashboard.html
  ├── css/
  │   └── styles.css
  ├── js/
  │   └── app.js
  └── README.md
```