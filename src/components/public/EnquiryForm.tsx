import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Phone,
  Mail,
  MapPin,
  Building,
  Home,
  Handshake,
  LandPlot,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Type Definitions for TypeScript ---

// Defines the shape of our form data
interface FormData {
  propertyType: "villa" | "apartment" | "plot" | "commercial" | "";
  budget: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Defines the structure for our visual assets map
type PropertyVisuals = {
  [key in FormData["propertyType"] | "default"]: {
    icon: JSX.Element;
    image: string;
  };
};

// --- Helper Components & Constants ---

const propertyVisuals: PropertyVisuals = {
  default: {
    icon: <Building className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2400&auto=format&fit=crop",
  },
  villa: {
    icon: <Home className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop",
  },
  apartment: {
    icon: <Building className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2400&auto=format&fit=crop",
  },
  plot: {
    icon: <LandPlot className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2400&auto=format&fit=crop",
  },
  commercial: {
    icon: <Handshake className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2400&auto=format&fit=crop",
  },
  "": {
    // Fallback for when propertyType is empty
    icon: <Building className="h-8 w-8 text-white" />,
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2400&auto=format&fit=crop",
  },
};

const ModernEnquiryForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [formData, setFormData] = useState<FormData>({
    propertyType: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (value: FormData["propertyType"]) => {
    setFormData((prev) => ({ ...prev, propertyType: value }));
  };

  const handleNextStep = (): void => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = (): void => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(2);
      console.log(formData);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVisuals = propertyVisuals[formData.propertyType || "default"];

  const steps: JSX.Element[] = [
    // --- Step 1: Property Details ---
    <motion.div
      key="step1"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-md font-vidaloka text-gray-800">
        Tell us what you're looking for
      </h2>
      <p className="text-gray-500 mt-1  mb-6">Let's start with the basics.</p>
      <div className="space-y-6">
        <div>
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select
            value={formData.propertyType}
            onValueChange={(value: FormData["propertyType"]) =>
              handlePropertyTypeChange(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="e.g., Luxury Villa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budget">Your Budget (INR) *</Label>
          <Select
            value={formData.budget}
            onValueChange={(value) => handleInputChange("budget", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="below-50">Below ₹50 Lakhs</SelectItem>
              <SelectItem value="50-100">₹50 Lakhs - ₹1 Crore</SelectItem>
              <SelectItem value="100-200">₹1 Crore - ₹2 Crores</SelectItem>
              <SelectItem value="above-200">Above ₹2 Crores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={handleNextStep}
        className="w-full mt-8"
        disabled={!formData.propertyType || !formData.budget}
      >
        Next Step <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>,

    // --- Step 2: Contact Information & Message ---
    <motion.div
      key="step2"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800">
        How can we reach you?
      </h2>
      <p className="text-gray-500 mt-1 mb-6">
        We'll get in touch to discuss your options.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Full Name *"
        />
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Email Address *"
        />
        <Input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Phone Number *"
        />
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Optional: Tell us more about your requirements..."
          rows={3}
        />
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            type="button"
            className="w-1/3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            className="w-2/3"
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.email ||
              !formData.phone
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>,

    // --- Step 3: Submission Success ---
    <motion.div
      key="step3"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center flex flex-col items-center justify-center h-full"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Send className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-md font-vidaloka text-gray-800 mt-4">
        Enquiry Sent!
      </h2>
      <p className="text-gray-600 mt-2 max-w-sm mx-auto">
        Thank you for your interest. A member of our team will contact you
        within 24 hours to discuss your new property.
      </p>
      <Button onClick={() => window.location.reload()} className="w-full mt-8">
        Start a New Enquiry
      </Button>
    </motion.div>,
  ];

  return (
    <section className="bg-[#F8F7F4] py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
          {/* --- Left Pane: Visuals --- */}
          <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-0">
            <AnimatePresence>
              <motion.div
                key={selectedVisuals.image}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedVisuals.image})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black bg-opacity-40 p-8 flex flex-col justify-end">
              <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {selectedVisuals.icon}
              </div>
              <h3 className="text-white text-3xl font-bold capitalize">
                {formData.propertyType || "Find Your Dream"}
              </h3>
              <p className="text-white/80 mt-1">
                {formData.propertyType
                  ? `Explore premium ${formData.propertyType}s with us.`
                  : "Begin your journey to a new home."}
              </p>
            </div>
          </div>

          {/* --- Right Pane: Form --- */}
          <div className="w-full lg:w-3/5 p-8 md:p-12 flex flex-col justify-center">
            <div className="w-full">
              {currentStep < 2 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
                  <motion.div
                    className="bg-blue-600 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 2) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  ></motion.div>
                </div>
              )}
              <AnimatePresence mode="wait">
                {steps[currentStep]}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* --- Integrated Contact & Business Info --- */}
        <div className="max-w-6xl mx-auto mt-16 text-center text-gray-600">
          <h3 className="text-xl font-bold text-gray-800">
            Or, Get in Touch Directly
          </h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Phone className="h-7 w-7 text-blue-600" />
              <p className="mt-2 font-semibold text-gray-700">
                +91 12345 67890
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="h-7 w-7 text-blue-600" />
              <p className="mt-2 font-semibold text-gray-700">
                info@estatecorp.com
              </p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-7 w-7 text-blue-600" />
              <p className="mt-2 font-semibold text-gray-700">
                123 Business District, City, State
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-700">Business Hours</p>
            <p className="text-sm mt-2">
              Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernEnquiryForm;
