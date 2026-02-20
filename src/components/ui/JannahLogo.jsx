// src/components/ui/JannahLogo.jsx
// Jannah cloud+J logo — white version for dark backgrounds

export function JannahLogoIcon({ size = 36, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Cloud shape */}
            <path
                d="M38 82C18 82 4 68 4 50C4 34 16 22 32 20C34 10 44 2 56 2C66 2 74 8 78 16C80 15 82 15 84 15C95 15 104 24 104 35C104 36 104 37 103 38C108 42 112 48 112 55C112 70 99 82 85 82Z"
                fill="white"
                opacity="0.92"
            />
            {/* J stroke */}
            <path
                d="M60 20C60 20 65 18 70 21C75 24 74 32 72 40L65 64C63 72 58 78 51 80C44 82 37 77 35 70C33 63 37 57 44 57"
                stroke="#0f1e2d"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* J dot */}
            <circle cx="68" cy="14" r="5" fill="#0f1e2d" />
            {/* J curl */}
            <path
                d="M44 57C39 59 35 65 37 72C39 79 48 82 55 77"
                stroke="#0f1e2d"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

export function JannahLogoHorizontal({ height = 36, className = '' }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <JannahLogoIcon size={height} />
            <span
                style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: height * 0.65,
                    color: 'white',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                }}
            >
                Jannah
            </span>
        </div>
    );
}

export function JannahLogoWithBadge({ height = 36, badge = 'OS1.0', className = '' }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <JannahLogoIcon size={height} />
            <div className="flex flex-col justify-center">
                <div
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: height * 0.55,
                        color: 'white',
                        letterSpacing: '-0.5px',
                        lineHeight: 1,
                        marginBottom: '-2px',
                    }}
                >
                    Jannah
                </div>
                <div
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: height * 0.24,
                        color: '#c3dc7f',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                    }}
                >
                    {badge}
                </div>
            </div>
        </div>
    );
}

export default JannahLogoIcon;
