const GolfIcon = ({
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
            <path fill="currentColor" d="M12 16q-2.925 0-4.962-2.037T5 9t2.038-4.962T12 2t4.963 2.038T19 9t-2.037 4.963T12 16m-2-7q.425 0 .713-.288T11 8t-.288-.712T10 7t-.712.288T9 8t.288.713T10 9m4 0q.425 0 .713-.288T15 8t-.288-.712T14 7t-.712.288T13 8t.288.713T14 9m-2-2q.425 0 .713-.288T13 6t-.288-.712T12 5t-.712.288T11 6t.288.713T12 7m-1 15v-1q0-.825-.587-1.412T9 19H7v-2h10v2h-2q-.825 0-1.412.588T13 21v1z" />
        </svg>
    );
};

export default GolfIcon;