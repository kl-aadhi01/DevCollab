import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'border border-border font-semibold text-sm text-textPrimary bg-white shadow-md rounded-xl',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
        },
      }}
    />
  );
};

export default Toast;
