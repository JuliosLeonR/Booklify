import { ReactNode } from "react";

type ModalProps = {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ show, onClose, title, children }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            &times;
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}