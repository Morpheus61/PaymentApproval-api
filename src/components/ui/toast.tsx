import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ open, onClose, title, message, type = 'info' }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={cn(
            'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden',
            'border-l-4',
            {
              'border-green-500': type === 'success',
              'border-red-500': type === 'error',
              'border-blue-500': type === 'info',
            }
          )}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon
                  className={cn('h-6 w-6', {
                    'text-green-500': type === 'success',
                    'text-red-500': type === 'error',
                    'text-blue-500': type === 'info',
                  })}
                />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {message && (
                  <p className="mt-1 text-sm text-gray-500">{message}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}