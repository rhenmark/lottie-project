const ControlButton = ({
  label,
  onClick,
  disabled,
  className,
  icon,
  ...otherProps
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  className: string;
  icon: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <button
      className={`${className} text-white px-2 py-2 rounded-md disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
      {...otherProps}
    >
      <div className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </div>
    </button>
  );
};

export default ControlButton;
