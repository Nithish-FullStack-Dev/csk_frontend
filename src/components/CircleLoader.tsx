import { Loader2 } from "lucide-react";
import MainLayout from "./layout/MainLayout";

const CircleLoader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
    </div>
  );
};

export default CircleLoader;
