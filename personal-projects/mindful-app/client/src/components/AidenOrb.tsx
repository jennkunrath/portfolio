interface AidenOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AidenOrb({ size = 'md', className = '' }: AidenOrbProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-6 h-6'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Main orb */}
      <div 
        className="w-full h-full rounded-full bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 shadow-sm"
        style={{
          animation: 'gentle-pulse 3s ease-in-out infinite',
          boxShadow: '0 0 6px rgba(99, 102, 241, 0.2)'
        }}
      />
      
      {/* Subtle inner glow */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"
        style={{
          animation: 'gentle-pulse 3s ease-in-out infinite 0.5s'
        }}
      />
    </div>
  );
}