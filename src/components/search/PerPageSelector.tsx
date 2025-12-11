import React from 'react';

interface PerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  isOpen: boolean;
  onToggle: () => void;
}

export const PerPageSelector: React.FC<PerPageSelectorProps> = ({
  value,
  onChange,
  options = [5, 10, 20, 50],
  isOpen,
  onToggle,
}) => {
  return (
    <div className="relative">
      <div
        onClick={onToggle}
        className="flex items-center space-x-3 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 rounded-xl px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm"
      >
        <span className="text-purple-300 text-sm">Tampilkan:</span>
        <span className="text-white font-bold text-lg px-3 py-1 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30">
          {value}
        </span>
        <span className="text-purple-300 text-sm">data</span>
        <svg 
          className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={onToggle}
          />
          
          <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-20 animate-slideDown">
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    onToggle();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                    value === option
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white hover:scale-102'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <span className={`font-semibold text-lg ${
                      value === option ? 'text-white' : 'text-purple-400'
                    }`}>
                      {option}
                    </span>
                    <span className="text-sm opacity-80">data per halaman</span>
                  </span>
                  {value === option && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"></div>
          </div>
        </>
      )}
    </div>
  );
};