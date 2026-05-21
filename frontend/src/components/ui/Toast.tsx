import React, { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// Global function to trigger a toast
export const showToast = (message: string, type: ToastType = 'info') => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => {
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[360px] pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white/95 text-gray-800';
        let icon = 'ℹ️';
        let borderColor = 'border-blue-400';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50/95 text-emerald-900';
          borderColor = 'border-emerald-500';
          icon = '✅';
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50/95 text-rose-900';
          borderColor = 'border-rose-500';
          icon = '❌';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-50/95 text-amber-900';
          borderColor = 'border-amber-500';
          icon = '⚠️';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-l-4 ${borderColor} ${bgColor} backdrop-blur-md transition-all duration-300 animate-slide-in pointer-events-auto`}
            style={{
              animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <span className="text-lg leading-none">{icon}</span>
            <p className="text-sm font-semibold tracking-wide leading-tight">{toast.message}</p>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
