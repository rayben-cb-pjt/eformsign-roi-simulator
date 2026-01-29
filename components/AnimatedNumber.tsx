import React, { useEffect, useRef } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    format?: (val: number) => string;
    className?: string;
    animate?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, format, className, animate = true }) => {
    const motionValue = useMotionValue(value);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 200 });
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!animate) return;
        motionValue.set(value);
    }, [value, motionValue, animate]);

    useEffect(() => {
        if (!animate) return;
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // Ensure we are setting a string to textContent
                ref.current.textContent = format ? format(latest) : Math.round(latest).toLocaleString();
            }
        });
    }, [springValue, format, animate]);

    if (!animate) {
        return (
            <span className={className}>
                {format ? format(value) : Math.round(value).toLocaleString()}
            </span>
        );
    }

    return <span ref={ref} className={className}>{format ? format(value) : Math.round(value).toLocaleString()}</span>;
};
