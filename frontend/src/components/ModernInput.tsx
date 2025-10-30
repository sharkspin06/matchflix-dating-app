import React from 'react';

interface ModernInputProps {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  minLength?: number;
  min?: string;
  max?: string;
  rows?: number;
}

export default function ModernInput({
  type,
  name,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  minLength,
  min,
  max,
  rows,
}: ModernInputProps) {
  const isTextarea = type === 'textarea';
  
  return (
    <div className="relative">
      <label 
        htmlFor={name}
        className={`absolute left-3 transition-all duration-200 pointer-events-none text-sm ${
          value 
            ? 'top-1.5 text-xs text-[#800020] font-medium' 
            : 'top-1/2 -translate-y-1/2 text-gray-500'
        }`}
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={value ? placeholder : ''}
          rows={rows || 4}
          className="w-full px-3 pt-6 pb-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-white focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 outline-none transition-all duration-200 resize-none text-sm"
          required={required}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={value ? placeholder : ''}
          className="w-full px-3 pt-6 pb-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-white focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 outline-none transition-all duration-200 text-sm"
          required={required}
          minLength={minLength}
          min={min}
          max={max}
        />
      )}
    </div>
  );
}
