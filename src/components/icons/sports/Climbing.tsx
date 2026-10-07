const ClimbingIcon = ({
    size = undefined,
    color = '#000000',
    strokeWidth = 0.2,
    background = 'transparent',
    opacity = 1,
    rotation = 0,
    shadow = 0,
    flipHorizontal = false,
    flipVertical = false,
    padding = 0
}) => {
    const transforms = [];
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    if (flipHorizontal) transforms.push('scaleX(-1)');
    if (flipVertical) transforms.push('scaleY(-1)');

    const viewBoxSize = 24 + (padding * 2);
    const viewBoxOffset = -padding;
    const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            width={size}
            height={size}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                opacity,
                transform: transforms.join(' ') || undefined,
                filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
                backgroundColor: background !== 'transparent' ? background : undefined
            }}
        >
            <path fill="currentColor" d="M3 2.2h4.2a1 1 0 0 1 1 1V20.8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.2a1 1 0 0 1 1-1z" />
            <circle cx="6.4" cy="7.2" r="1.35" fill="currentColor" />
            <circle cx="6.4" cy="14.2" r="1.35" fill="currentColor" />
            <circle cx="14.2" cy="4.3" r="1.85" fill="currentColor" />
            <path fill="currentColor" d="M12.6 6.4h3.1c.4 0 .8.3.9.7l1.5 3.4 3.4-.6c.7-.1 1.2.6.8 1.2l-1.5 2.1c-.3.4-.8.6-1.3.5l-2.6-.4-.4 2.6 2.7 3.6c.4.5.2 1.2-.4 1.4l-1.7.6c-.6.2-1.2-.2-1.4-.8l-2.4-4.2-1.5 4.4c-.2.6-.9.9-1.5.6l-1.4-.7c-.5-.3-.7-.9-.5-1.4l2.2-5.2-2.6-1.1c-.6-.3-.8-1-.5-1.6l1.2-2.1c.2-.4.7-.6 1.1-.5l2.4.7.2-1.6c.1-.8.8-1.4 1.6-1.4z" />
        </svg>
    );
};

export default ClimbingIcon;
