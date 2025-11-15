import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 ${className}`}
        {...props}
      />
      {label && (
        <label className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
}

