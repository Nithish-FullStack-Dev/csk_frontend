
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Home, FileText, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WelcomeBackBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if it's morning, afternoon or evening
  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
  };

  // Generate quick action buttons based on user role
  const getQuickActions = () => {
    if (user?.role === "customer_prospect") {
      return [
        { 
          icon: <Home className="h-5 w-5" />, 
          label: "Browse Properties", 
          action: () => navigate("/browse")
        },
        { 
          icon: <CalendarDays className="h-5 w-5" />, 
          label: "Schedule a Visit", 
          action: () => navigate("/visits")
        },
        { 
          icon: <FileText className="h-5 w-5" />, 
          label: "View Documents", 
          action: () => navigate("/documents")
        }
      ];
    }
    
    return [
      { 
        icon: <Home className="h-5 w-5" />, 
        label: "My Properties", 
        action: () => navigate("/properties")
      },
      { 
        icon: <CreditCard className="h-5 w-5" />, 
        label: "Payments", 
        action: () => navigate("/payments")
      },
      { 
        icon: <FileText className="h-5 w-5" />, 
        label: "Documents", 
        action: () => navigate("/documents")
      }
    ];
  };

  return (
    <Card className="bg-estate-navy text-white mb-6 overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Decorative circles in background */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mt-10 -mr-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 -mb-20 -ml-20" />
        
        <div className="relative z-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Good {getTimeOfDay()}, {user?.name}!
            </h2>
            <p className="text-white/80 mt-1">
              Welcome back to CSK - Real Manager portal
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {getQuickActions().map((action, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={action.action}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBackBanner;
