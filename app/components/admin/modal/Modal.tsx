import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            &times;
          </button>
        </div>
        <div className="p-2">
          {children}
        </div>
        {footer && (
          <div className="p-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
