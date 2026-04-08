const SoccerIcon = ({
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
            <path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m5-12.5l1.35-.45l.4-1.35q-.8-1.2-1.925-2.062T14.35 4.35L13 5.3v1.4zm-10 0l4-2.8V5.3l-1.35-.95q-1.35.425-2.475 1.287T5.25 7.7l.4 1.35zm-1.05 7.7l1.15-.1l.75-1.35L6.4 11.4L5 10.9l-1 .75q0 1.625.45 2.962t1.5 2.588M12 20q.65 0 1.275-.1t1.225-.3l.7-1.5l-.65-1.1h-5.1l-.65 1.1l.7 1.5q.6.2 1.225.3T12 20m-2.25-5h4.5l1.4-4L12 8.45L8.4 11zm8.3 2.2q1.05-1.25 1.5-2.587T20 11.65l-1-.7l-1.4.45l-1.45 4.35l.75 1.35z" />
        </svg>
    );
};

export default SoccerIcon;