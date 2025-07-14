import React from "react";
import { easeOut, motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Target } from "lucide-react";

interface ValuesProps {
  title: string;
  description: string;
  icon?: any;
}

const Values = ({ title, description, icon: Icon }: ValuesProps) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full p-8 rounded-xl shadow-lg bg-[#FFFACD] border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
        <CardContent className="p-0 text-center">
          {Icon}
          <h3 className="text-2xl font-md font-vidaloka text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Values;
