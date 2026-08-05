import { useEffect, useState, useRef } from 'react';

/**
 * Komponen pembungkus untuk animasi scroll smooth reveal.
 * Digunakan secara global di seluruh halaman aplikasi.
 */
export default function RevealSection({ children, className = '', threshold = 0.1 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out transform ${isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-[0.98]'
                } ${className}`}
        >
            {children}
        </div>
    );
}