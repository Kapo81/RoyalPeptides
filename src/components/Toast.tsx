import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-24 right-4 z-50 animate-[slideInRight_0.3s_ease-out]">
      <div className="bg-white shadow-lg rounded-lg border-2 border-green-500 px-6 py-4 flex items-center space-x-3 min-w-[300px]">
        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        <p className="text-gray-900 font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
