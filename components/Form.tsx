import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export default function Form({ children, className = '', ...props }: FormProps) {
  return (
    <form className={`space-y-4 ${className}`} {...props}>
      {children}
    </form>
  );
}

