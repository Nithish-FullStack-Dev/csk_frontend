import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, Eye, Phone, Mail, MapPin, Clock } from "lucide-react";
import axios from "axios";

const ContactCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact info on component mount
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/contact/contactInfo`
        );
        setContactInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/api/contact/updateContactInfo`,
        contactInfo
      );
      setIsEditing(false);
      console.log("Saved:", contactInfo);
    } catch (error) {
      console.error("Failed to save contact info:", error);
    }
  };

  const updateField = (field, value) => {
    setContactInfo({ ...contactInfo, [field]: value });
  };

  const updateSocialMedia = (platform, value) => {
    setContactInfo({
      ...contactInfo,
      socialMedia: {
        ...contactInfo.socialMedia,
        [platform]: value,
      },
    });
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!contactInfo)
    return <div className="p-4 text-center">Failed to load contact info.</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <CardTitle>Contact Information Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Manage contact details, business hours, and company information
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {isEditing ? (
              <Button
                onClick={handleSave}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={contactInfo.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="workingHours">Working Hours</Label>
                  <Input
                    id="workingHours"
                    value={contactInfo.workingHours}
                    onChange={(e) =>
                      updateField("workingHours", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={contactInfo.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="aboutText">About Text</Label>
                  <Textarea
                    id="aboutText"
                    value={contactInfo.aboutText}
                    onChange={(e) => updateField("aboutText", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-estate-navy rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground break-words">
                      {contactInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-estate-navy rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground break-words">
                      {contactInfo.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {/* Icon wrapper */}
                <div className="flex-shrink-0 w-10 h-10 bg-estate-navy rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>

                {/* Text wrapper */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground break-words">
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-estate-navy rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Working Hours</p>
                  <p className="text-muted-foreground break-words">
                    {contactInfo.workingHours}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Management */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={contactInfo.socialMedia.facebook}
                  onChange={(e) =>
                    updateSocialMedia("facebook", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={contactInfo.socialMedia.twitter}
                  onChange={(e) => updateSocialMedia("twitter", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={contactInfo.socialMedia.linkedin}
                  onChange={(e) =>
                    updateSocialMedia("linkedin", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={contactInfo.socialMedia.instagram}
                  onChange={(e) =>
                    updateSocialMedia("instagram", e.target.value)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg break-words">
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-muted-foreground truncate">
                  {contactInfo.socialMedia.facebook}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg break-words">
                <p className="font-medium">Twitter</p>
                <p className="text-sm text-muted-foreground truncate">
                  {contactInfo.socialMedia.twitter}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg break-words">
                <p className="font-medium">LinkedIn</p>
                <p className="text-sm text-muted-foreground truncate">
                  {contactInfo.socialMedia.linkedin}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg break-words">
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground truncate">
                  {contactInfo.socialMedia.instagram}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactCMS;
