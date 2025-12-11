import React from 'react';

interface FormCheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  description,
  checked,
  onChange,
  error,
  activeLabel = 'Aktif',
  inactiveLabel = 'Nonaktif',
}) => {
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <div className={`bg-white/5 border rounded-xl p-4 transition-all ${
        hasError ? 'border-red-500/50' : 'border-white/10'
      }`}>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="w-6 h-6 rounded-lg border-2 border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all"
              aria-invalid={hasError}
              aria-describedby={hasError ? `${label}-error` : undefined}
            />
          </div>
          <div className="flex-1">
            <span className="text-purple-200 font-semibold group-hover:text-white transition-colors">
              {label}
            </span>
            {description && (
              <p className="text-xs text-purple-400/70 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            checked 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {checked ? activeLabel : inactiveLabel}
          </div>
        </label>
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
    </div>
  );
};