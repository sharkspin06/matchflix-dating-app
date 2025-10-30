import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-gradient-to-r from-orange-600 to-orange-800 text-white hover:from-orange-700 hover:to-orange-900 focus:ring-orange-500 shadow-lg hover:shadow-xl transition-all':
              variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500':
              variant === 'secondary',
            'border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500':
              variant === 'outline',
            'bg-transparent hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500':
              variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
