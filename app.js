// Elementos del DOM
const fetchBtn = document.getElementById('fetch-btn');
const apiUrlInput = document.getElementById('api-url');
const resultDiv = document.getElementById('result');

// Evento del botón
fetchBtn.addEventListener('click', () => {
  const url = apiUrlInput.value.trim();
  if (!url) {
    resultDiv.textContent = '⚠️ Ingresa una URL válida';
    return;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      resultDiv.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      resultDiv.textContent = `❌ Error: ${error.message}`;
    });
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registrado:', registration.scope);
      })
      .catch(error => {
        console.log('Error al registrar SW:', error);
      });
  });
}