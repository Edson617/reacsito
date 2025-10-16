// src/pushManager.js

// Convierte la clave pública VAPID en un Uint8Array válido
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    alert("Tu navegador no soporta Service Workers 😢");
    return;
  }

  try {
    // Registrar el service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ Service Worker registrado:", registration);

    // Pedir permiso de notificaciones
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Debes permitir las notificaciones para activarlas 🔔");
      return;
    }

    // Clave pública del servidor (ejemplo, luego se reemplaza)
    const vapidPublicKey =
      "BLoHL9KYzY6oLDUbNVliUs_sDNCct3YRUXqTXRdwXeN8UzNOIliPo2TuhgMCH9OLmMMXygMPjRG21bZvcDwU6k8";

    // Crear la suscripción push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log("📬 Suscripción Push creada:", subscription);

    // (Opcional) enviar la suscripción a tu servidor backend
    await fetch("/api/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    alert("🎉 ahuevo activaste las notificaciones eres un goat");
  } catch (error) {
    console.error("❌ Error al registrar notificaciones push:", error);
  }
}
