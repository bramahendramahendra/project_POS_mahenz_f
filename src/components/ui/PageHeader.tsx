import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon = '📋',
}) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">
        {title} {icon}
      </h2>
      <p className="text-purple-200">{subtitle}</p>
    </div>
  );
};