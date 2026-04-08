import React from 'react';

const CricketIcon = ({
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
            <path fill="currentColor" d="M15 14.2L12.2 17q-.3.3-.7.3t-.7-.3L2.3 8.5Q2 8.2 2 7.825t.3-.675l2.8-2.8q.3-.3.725-.3t.725.3L15 12.8q.3.3.3.7t-.3.7m3.6 7.8l-4.25-4.25l1.4-1.4L20 20.6zm-.1-13q-1.45 0-2.475-1.025T15 5.5t1.025-2.475T18.5 2t2.475 1.025T22 5.5t-1.025 2.475T18.5 9" />
        </svg>
    );
};

export default CricketIcon;