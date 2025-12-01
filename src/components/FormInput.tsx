import React from 'react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'tel' | 'email';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  error,
  icon,
  helperText,
}) => {
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <label className="block text-purple-200 text-sm font-semibold mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-purple-300/50 focus:outline-none transition-all ${
            hasError
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : 'border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          }`}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
        />
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-xs text-red-400 ml-1 flex items-center space-x-1 animate-shake">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {!hasError && helperText && (
        <p className="text-xs text-purple-400/70 ml-1">{helperText}</p>
      )}
      {!hasError && maxLength && (
        <p className="text-xs text-purple-400/70 ml-1">
          Maksimal {maxLength} karakter ({value.length}/{maxLength})
        </p>
      )}
    </div>
  );
};

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  error?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  rows = 4,
  error,
  helperText,
}) => {
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <label className="block text-purple-200 text-sm font-semibold mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-purple-300/50 focus:outline-none transition-all resize-none ${
            hasError
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : 'border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          }`}
          placeholder={placeholder}
          rows={rows}
          required={required}
          maxLength={maxLength}
        />
        {hasError && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-xs text-red-400 ml-1 flex items-center space-x-1 animate-shake">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {!hasError && helperText && (
        <p className="text-xs text-purple-400/70 ml-1">{helperText}</p>
      )}
      {!hasError && maxLength && (
        <p className="text-xs text-purple-400/70 ml-1">
          Maksimal {maxLength} karakter ({value.length}/{maxLength})
        </p>
      )}
    </div>
  );
};