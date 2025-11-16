import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastMessage from '../UI/ToastMessage';
import { BirdSkin } from '../../types/game';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', skin?: BirdSkin) => void;
  showPurchaseSuccess: (skin: BirdSkin, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  skin?: BirdSkin;
  isVisible: boolean;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', skin?: BirdSkin) => {
    const id = Date.now().toString();
    const newToast: ToastState = {
      id,
      message,
      type,
      skin,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const showPurchaseSuccess = useCallback((skin: BirdSkin, message?: string) => {
    const defaultMessage = `${skin.name} 已成功解锁！现在可以使用这个皮肤了！`;
    showToast(message || defaultMessage, 'success', skin);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    showPurchaseSuccess
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* 渲染所有活跃的Toast消息 */}
      {toasts.map(toast => (
        <ToastMessage
          key={toast.id}
          type={toast.type}
          message={toast.message}
          skin={toast.skin}
          isVisible={toast.isVisible}
          onClose={() => removeToast(toast.id)}
          autoClose={true}
          duration={4000}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;