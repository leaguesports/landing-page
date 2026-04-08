
const PadelIcon = ({
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
            <path fill="currentColor" d="m18.6 22l-5.825-5.8l-.7.7q-.575.575-1.312.875t-1.513.3t-1.525-.3T6.4 16.9l-4.225-4.25q-.575-.575-.875-1.312T1 9.825t.3-1.512T2.175 7L5 4.175Q5.575 3.6 6.313 3.3T7.825 3t1.513.3t1.312.875L14.9 8.4q.575.575.875 1.325t.3 1.525t-.3 1.513t-.875 1.312l-.7.7L20 20.6zM5.175 11.1q.325 0 .538-.212t.212-.538t-.212-.537t-.538-.213t-.537.213t-.213.537t.213.538t.537.212m1.6-1.575q.325 0 .538-.212t.212-.538t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212m.175 3.35q.325 0 .538-.213t.212-.537t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212m1.4-4.95q.325 0 .538-.213t.212-.537t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212m.2 3.375q.325 0 .537-.213t.213-.537t-.213-.537T8.55 9.8t-.537.213t-.213.537t.213.538t.537.212m.15 3.35q.325 0 .538-.213t.212-.537t-.212-.537t-.538-.213t-.537.213t-.213.537t.213.538t.537.212m1.425-4.95q.325 0 .538-.213t.212-.537t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212m.175 3.35q.325 0 .538-.213t.212-.537t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212m1.6-1.6q.325 0 .538-.212t.212-.538t-.213-.537t-.537-.213t-.537.213t-.213.537t.213.538t.537.212M19.5 9q-1.45 0-2.475-1.025T16 5.5t1.025-2.475T19.5 2t2.475 1.025T23 5.5t-1.025 2.475T19.5 9" />
        </svg>
    );
};

export default PadelIcon;