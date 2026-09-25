'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'warning' | 'idle' | 'danger';
  text: string;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, icon }) => {
  const styles = {
    active: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    warning: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    idle: 'bg-neutral-900/70 border-white/10 text-neutral-400',
    danger: 'bg-red-950/70 border-red-500/40 text-red-300',
  };

  const dots = {
    active: 'bg-emerald-400 animate-ping',
    warning: 'bg-amber-400',
    idle: 'bg-neutral-500',
    danger: 'bg-red-400',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${styles[status]}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dots[status]}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dots[status].split(' ')[0]}`} />
      </span>
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
};
