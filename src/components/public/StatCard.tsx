import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon?: any;
  index: number;
  variants: any;
}

const useCounter = (end: number, duration: number = 2500) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.6 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [end, duration, hasStarted]);

  return { count, ref };
};

const StatCard = ({
  label,
  value,
  suffix = "",
  icon: Icon,
  index,
  variants,
}: StatCardProps) => {
  const { count, ref } = useCounter(value);

  return (
    <motion.div
      className="text-center md:text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      variants={variants}
      custom={index}
    >
      <div
        ref={ref}
        className="flex items-center justify-center md:justify-start mb-2"
      >
        {Icon && <Icon className="h-9 w-9 text-purple-600 mr-3" />}
        <span className="text-3xl font-extrabold text-gray-900">
          {count}
          {suffix}
        </span>
      </div>
      <div className="text-base text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
};

export default StatCard;
