/**
 * Toast notification utility for showing temporary messages
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, default 10000
}

/**
 * Show a toast notification
 */
export const showToast = (options: ToastOptions): void => {
  const { message, type, duration = 10000 } = options;
  
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    `;
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  const bgColors = {
    success: '#198754',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0'
  };
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.style.cssText = `
    background-color: ${bgColors[type]};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    font-size: 14px;
    font-weight: 500;
  `;
  
  toast.innerHTML = `
    <span style="font-size: 18px; font-weight: bold;">${icons[type]}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; margin: 0; opacity: 0.8;">×</button>
  `;
  
  container.appendChild(toast);
  
  // Add animation styles if not already added
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto-dismiss after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  console.info(`[TOAST] ${type.toUpperCase()}: ${message}`);
};
