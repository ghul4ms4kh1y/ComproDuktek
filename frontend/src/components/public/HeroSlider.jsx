import { useState, useEffect } from "react";

const heroImages = ["/bg-3.png", "/bg-2.png", "/bg-1.png"];

const SLIDE_DURATION = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Ilustrasi Dukungan Teknologi Siber ${i + 1}`} // Alt text dinamis
          loading="lazy" // Lazy loading native
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
