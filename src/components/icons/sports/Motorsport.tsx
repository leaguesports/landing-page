const MotorsportIcon = ({
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
            <path fill="currentColor" d="M14.475 19.45H2.4q-.125 0-.225-.1t-.1-.225q0-1.175.038-2.062t.112-1.588h7.85q1.725 0 2.938-1.225t1.212-3q0-1.275-.712-2.312T11.6 7.4L8.25 6.075q1.35-.75 2.838-1.137t3.087-.388q3.2 0 5.475 2.163T21.925 12t-2.162 5.288t-5.288 2.162M2.55 13.5q.5-1.775 1.475-3.338T6.35 7.4l4.5 1.825q.65.275 1.025.825t.375 1.2q0 .95-.637 1.6t-1.588.65z" />
        </svg>
    );
};

export default MotorsportIcon;