import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footerContent }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
    >
      <div
        className={`bg-white rounded-lg shadow-xl transform transition-all sm:align-middle w-full ${sizeClasses[size]} m-4 max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
      >
        {/* Modal Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <X size={24} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="px-6 py-5 flex-grow overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer */}
        {footerContent && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right space-x-3">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;