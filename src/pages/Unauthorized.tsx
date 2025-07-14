
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <div className="text-center">
        <ShieldAlert className="h-24 w-24 mx-auto text-estate-error mb-6" />
        <h1 className="text-4xl font-bold text-estate-navy mb-4">Access Denied</h1>
        <p className="text-xl text-estate-darkGray mb-8">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/">Go to Dashboard</Link>
          </Button>
          <Button asChild className="bg-estate-navy hover:bg-estate-navy/90">
            <Link to="/login">Change Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
