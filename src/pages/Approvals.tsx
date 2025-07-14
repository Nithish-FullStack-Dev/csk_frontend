import { useEffect, useState } from "react";
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
  CheckCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { ContactInfo } from "@/pages/public/ContactPage"; // Assuming this path is correct
import { ToastAction } from "@/components/ui/toast"; // Assuming this path is correct

// --- Type Definitions for TypeScript ---

// Defines the shape of our form data
interface FormData {
  propertyType: "villa" | "apartment" | "plot" | "commercial" | "";
  budget: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  otp: string; // Added OTP field
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
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  // State to store the email that was last successfully verified
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    propertyType: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    otp: "",
  });

  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
  });

  const fetchContactInfo = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/contact/contactInfo"
      );
      setContact(data);
    } catch (error) {
      console.log("error while fetching contact", error);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      // If the email field is being changed
      if (field === "email") {
        // If the email was previously verified AND the new email is different from the verified one
        if (isOtpVerified && value !== verifiedEmail) {
          setIsOtpVerified(false); // Invalidate OTP verification
          setOtpSent(false); // Reset OTP sent status
          setFormData((p) => ({ ...p, otp: "" })); // Clear OTP field
          // No need to clear verifiedEmail here; it remains the "old" verified one
          // until a new one is successfully verified.
        }
        // If the new email matches the verified email, re-validate
        if (value === verifiedEmail && verifiedEmail !== "") {
          setIsOtpVerified(true);
          setOtpSent(true); // Assuming OTP was sent for this verified email
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const handlePropertyTypeChange = (value: FormData["propertyType"]) => {
    setFormData((prev) => ({ ...prev, propertyType: value }));
  };

  const handleNextStep = (): void => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = (): void => {
    setCurrentStep((prev) => prev - 1);
    // When going back from contact form, if OTP was sent, reset related states
    if (currentStep === 1) {
      setOtpSent(false);
      setIsOtpVerified(false);
      setVerifiedEmail("");
      setFormData((p) => ({ ...p, otp: "" }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address to send OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/auth/send-otp", {
        email: formData.email,
      });
      setOtpSent(true);
      setIsOtpVerified(false); // Ensure it's false until verified
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${formData.email}. Please check your inbox.`,
      });
    } catch (error) {
      console.error("Failed to send OTP", error);
      toast({
        title: "Error",
        description:
          "Failed to send OTP. Please ensure your email is correct and try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP to verify.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-otp",
        {
          email: formData.email,
          otp: formData.otp,
        }
      );

      if (response.data.success) {
        setIsOtpVerified(true);
        setVerifiedEmail(formData.email); // Store the successfully verified email
        toast({
          title: "OTP Verified",
          description: "Your email has been successfully verified.",
        });
        // No auto-next-step here, user needs to fill other fields and then submit
      } else {
        toast({
          title: "Verification Failed",
          description: "The OTP you entered is incorrect or has expired.",
          variant: "destructive",
        });
        setIsOtpVerified(false);
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      toast({
        title: "Verification Error",
        description:
          "Something went wrong during OTP verification. Please try again.",
        variant: "destructive",
      });
      setIsOtpVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final check before submission
    if (!isOtpVerified || formData.email !== verifiedEmail) {
      toast({
        title: "Verification Required",
        description: "Please verify your email address before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Also check other required fields if needed, though they are usually handled by `disabled` prop
    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const submittedData = { ...formData };
    let isUndoClicked = false;
    let isSaved = false;

    const toastObj = toast({
      title: "Success",
      description: "Your enquiry has been sent!",
      duration: 3000,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            if (isSaved) return;

            isUndoClicked = true;
            clearTimeout(undoTimeout);
            setCurrentStep(0); // Reset to first step
            setIsSubmitting(false);
            setOtpSent(false); // Reset OTP states
            setIsOtpVerified(false);
            setVerifiedEmail(""); // Clear verified email
            setFormData({
              ...formData,
              otp: "", // Clear OTP field
              name: "",
              email: "",
              phone: "",
              message: "",
            });

            toast({
              title: "Cancelled",
              description: "Your enquiry was not saved.",
            });
          }}
        >
          Undo
        </ToastAction>
      ),
    });

    const undoTimeout = setTimeout(async () => {
      if (!isUndoClicked) {
        try {
          const response = await axios.post(
            "http://localhost:3000/api/enquiryForm/saveForm",
            submittedData
          );
          isSaved = true;
          toastObj.dismiss();
          setCurrentStep(2); // Move to the final success step (step 3 in original, now 2)
        } catch (error) {
          console.error("Failed to save form", error);
          toast({
            title: "Submission Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
          setOtpSent(false); // Reset OTP states
          setIsOtpVerified(false);
          setVerifiedEmail(""); // Clear verified email
          setFormData({ ...formData, otp: "" }); // Clear OTP
        }
      }
    }, 3000);
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
      <p className="text-gray-500 mt-1 mb-6">Let's start with the basics.</p>
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
              <SelectItem value="below-₹50 Lakhs">Below ₹50 Lakhs</SelectItem>
              <SelectItem value="₹50 Lakhs - ₹1 Crore">
                ₹50 Lakhs - ₹1 Crore
              </SelectItem>
              <SelectItem value="₹1 Crore - ₹2 Crores">
                ₹1 Crore - ₹2 Crores
              </SelectItem>
              <SelectItem value="above ₹2 Crores">Above ₹2 Crores</SelectItem>
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

    // --- Step 2 (Original Step 2): Contact Information & OTP Verification ---
    <motion.div
      key="step2"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-md font-vidaloka text-gray-800">
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
        <div className="flex gap-2 items-end">
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Email Address *"
            // Disable email input only if it's currently verified and hasn't changed
            disabled={isOtpVerified && formData.email === verifiedEmail}
          />
          {isOtpVerified && formData.email === verifiedEmail ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Verified</span>
            </div>
          ) : (
            <Button
              onClick={handleSendOtp}
              type="button"
              disabled={
                !formData.email || // Email must be present
                (otpSent && formData.email === verifiedEmail) || // Already sent for this verified email
                isSubmitting // Prevent sending during form submission
              }
              className="whitespace-nowrap"
            >
              {otpSent && formData.email === verifiedEmail
                ? "OTP Sent!"
                : "Send OTP"}
            </Button>
          )}
        </div>
        {(otpSent && formData.email !== verifiedEmail) ||
        (otpSent && !isOtpVerified) ? ( // Show OTP field if OTP sent but not verified OR if email changed after verification
          <div className="flex gap-2 items-end">
            <Input
              id="otp"
              type="text"
              required
              value={formData.otp}
              onChange={(e) => handleInputChange("otp", e.target.value)}
              placeholder="Enter OTP *"
            />
            <Button
              onClick={handleVerifyOtp}
              type="button"
              disabled={!formData.otp || isOtpVerified || isSubmitting}
              className="whitespace-nowrap"
            >
              Verify OTP
            </Button>
          </div>
        ) : null}

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
              !formData.phone ||
              !isOtpVerified || // Email must be verified
              formData.email !== verifiedEmail // And the current email must match the verified one
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>,

    // --- Step 3 (Original Step 3, now index 2): Submission Success ---
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
      <Button
        onClick={() => {
          setFormData({
            propertyType: "",
            budget: "",
            name: "",
            email: "",
            phone: "",
            message: "",
            otp: "",
          });
          setCurrentStep(0);
          setOtpSent(false);
          setIsOtpVerified(false);
          setVerifiedEmail(""); // Clear verified email on new enquiry
        }}
        className="w-full mt-8"
      >
        Start a New Enquiry
      </Button>
    </motion.div>,
  ];

  // Adjust total steps for progress bar
  const totalSteps = steps.length - 1; // Total interactive steps are 0 and 1, success is 2

  return (
    <section className="bg-[#F8F7F4] py-4 md:py-5">
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
              {currentStep < totalSteps && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
                  <motion.div
                    className="bg-blue-600 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
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
                {contact.phone}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="h-7 w-7 text-blue-600" />
              <p className="mt-2 font-semibold text-gray-700">
                {contact.email}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-7 w-7 text-blue-600" />
              <p className="mt-2 font-semibold text-gray-700">
                {contact.address}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-700">Business Hours</p>
            <p className="text-sm mt-2">{contact.workingHours}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernEnquiryForm;


