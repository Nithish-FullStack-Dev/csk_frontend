import React, { useState, useEffect } from "react";
import { motion, easeOut, useMotionValue, useSpring } from "framer-motion";
import { Card, CardContent } from "../ui/card";

interface ValuesProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const Values = ({ title, description, icon: Icon }: ValuesProps) => {
  // Raw mouse positions (fast updates)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the motion values with spring physics
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // We'll store gradient as a string
  const [gradient, setGradient] = useState(
    "radial-gradient(circle 300px at center, rgba(212,175,55,0.2), transparent 80%)"
  );

  // Update gradient smoothly when spring values change
  useEffect(() => {
    const updateGradient = () => {
      setGradient(
        `radial-gradient(circle 300px at ${smoothX.get()}px ${smoothY.get()}px, rgba(212,175,55,0.4), transparent 80%)`
      );
    };

    const unsubscribeX = smoothX.on("change", updateGradient);
    const unsubscribeY = smoothY.on("change", updateGradient);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [smoothX, smoothY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut },
    },
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        onMouseMove={handleMouseMove}
        className="relative h-full p-8 rounded-xl shadow-lg text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
        style={{ background: gradient }}
      >
        <CardContent className="p-0 text-center relative z-10">
          {Icon && <div className="mb-4 text-slate-200">{Icon}</div>}
          <h3 className="text-4xl font-bold mb-3 font-vidaloka text-[#D4AF37]">
            {title}
          </h3>
          <p className="text-estate-navy text-lg leading-relaxed">
            {description}
          </p>
        </CardContent>

        {/* Optional subtle overlay for better blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none rounded-xl"></div>
      </Card>
    </motion.div>
  );
};

export default Values;
