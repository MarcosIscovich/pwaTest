// Elementos del DOM
const fetchBtn = document.getElementById('fetch-btn');
const apiUrlInput = document.getElementById('api-url');
const resultDiv = document.getElementById('result');
const installBtn = document.getElementById('install-btn');

// Variable para almacenar el evento de instalación
let deferredPrompt;

// Evento del botón de fetch
fetchBtn.addEventListener('click', async () => {
  const url = apiUrlInput.value.trim();
  if (!url) {
    resultDiv.textContent = '⚠️ Ingresa una URL válida';
    return;
  }

  try {
    resultDiv.textContent = 'Cargando...';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP! estado: ${response.status}`);
    }
    
    const data = await response.json();
    resultDiv.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultDiv.textContent = `❌ Error: ${error.message}`;
    console.error('Error al hacer fetch:', error);
  }
});

// Evento para instalar la PWA
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('Usuario aceptó la instalación');
    installBtn.style.display = 'none';
  }
  
  deferredPrompt = null;
});

// Evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  console.log('Evento beforeinstallprompt activado');
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registrado correctamente con scope:', registration.scope);
        
        // Verificar si hay una nueva versión del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Nueva versión del Service Worker encontrada');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              console.log('Nueva versión del Service Worker instalada');
            }
          });
        });
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });

  // Verificar actualizaciones periódicamente
  setInterval(() => {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (registration) {
          registration.update();
          console.log('Buscando actualizaciones del Service Worker...');
        }
      });
  }, 60 * 60 * 1000); // Cada hora
}

// Verificar conexión
window.addEventListener('online', () => {
  console.log('Estás en línea');
  resultDiv.textContent = 'Conectado a internet';
  setTimeout(() => resultDiv.textContent = '', 2000);
});

window.addEventListener('offline', () => {
  console.log('Estás desconectado');
  resultDiv.textContent = 'Estás desconectado - Modo offline activado';
});