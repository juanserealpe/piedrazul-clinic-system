/**
 * Mostrar notificación del sistema (OS-level notification)
 * Si el navegador no soporta Notification API, usa fallback a alert()
 */
export function showSystemNotification(title: string, options?: NotificationOptions) {
  if ("Notification" in window) {
    // Solicitar permiso si es necesario
    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        } else {
          // Fallback a alert si el usuario deniega permisos
          alert(title);
        }
      });
    }
  } else {
    // Fallback para navegadores que no soportan Notification API
    alert(title);
  }
}

/**
 * Notificación de éxito
 */
export function showSuccess(message: string) {
  showSystemNotification(message, {
    icon: undefined,
    tag: "success",
  });
}

/**
 * Notificación de error
 */
export function showError(message: string) {
  showSystemNotification(message, {
    icon: undefined,
    tag: "error",
  });
}

/**
 * Notificación de información
 */
export function showInfo(message: string) {
  showSystemNotification(message, {
    icon: undefined,
    tag: "info",
  });
}
