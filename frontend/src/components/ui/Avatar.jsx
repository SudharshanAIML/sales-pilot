const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white font-medium ${sizes[size]} ${className}`;
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${baseClasses} object-cover`}
      />
    );
  }
  
  return (
    <div className={baseClasses}>
      {getInitials(name || alt)}
    </div>
  );
};

export default Avatar;