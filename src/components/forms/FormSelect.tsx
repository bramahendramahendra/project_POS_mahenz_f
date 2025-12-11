import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  required = false,
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
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-10 py-3.5 bg-white/5 border rounded-xl text-white focus:outline-none transition-all appearance-none cursor-pointer ${
            hasError
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : 'border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          }`}
          style={{
            colorScheme: 'dark'
          }}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        >
          <option value="" className="bg-slate-800 text-white py-2">
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-slate-800 text-white py-2"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          {hasError ? (
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
          ) : (
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      {hasError && (
        <p 
          id={`${label}-error`}
          className="text-xs text-red-400 ml-1 flex items-center space-x-1 animate-shake"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Global styles untuk select options */}
      <style jsx>{`
        select {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        select option {
          background-color: #1e293b !important;
          color: white !important;
          padding: 8px 12px !important;
        }
        
        select option:checked {
          background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%) !important;
          color: white !important;
          font-weight: 600 !important;
        }

        select option:hover {
          background-color: #334155 !important;
          color: white !important;
        }

        select option:focus {
          background-color: #475569 !important;
          color: white !important;
        }

        select:focus option:checked {
          background: #7c3aed !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};