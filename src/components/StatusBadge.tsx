interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'processing' | 'error';
  text?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const statusConfig = {
  online: { color: 'bg-emerald-400', text: 'text-emerald-400', label: 'Online' },
  offline: { color: 'bg-gray-400', text: 'text-gray-400', label: 'Offline' },
  warning: { color: 'bg-amber-400', text: 'text-amber-400', label: 'Warning' },
  processing: { color: 'bg-blue-400', text: 'text-blue-400', label: 'Processing' },
  error: { color: 'bg-red-400', text: 'text-red-400', label: 'Error' },
};

export default function StatusBadge({ status, text, size = 'md', pulse = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  };

  return (
    <div className={`inline-flex items-center rounded-full bg-white/5 border border-white/10 ${sizeClasses[size]}`}>
      <span className="relative flex h-2 w-2">
        {pulse && status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      <span className={`${config.text} font-medium`}>{text || config.label}</span>
    </div>
  );
}
