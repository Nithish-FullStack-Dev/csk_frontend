import React, { useState } from "react";
import { easeOut, motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

interface ValuesProps {
  title: string;
  description: string;
  icon?: any;
}

const Values = ({ title, description, icon: Icon }: ValuesProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const gradientStyle = {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,223,128,0.5), #002147)`,
    transition: "background 0.2s ease-out",
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="h-full p-8 rounded-xl shadow-lg border border-gray-100 bg-estate-navy text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        onMouseMove={handleMouseMove}
        style={gradientStyle}
      >
        <CardContent className="p-0 text-center">
          {Icon}
          <h3 className="text-2xl font-md font-vidaloka font-bold text-white mb-3">
            {title}
          </h3>
          <p className="text-[#f4f4f4] leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Values;
