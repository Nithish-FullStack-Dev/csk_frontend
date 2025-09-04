import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, Eye, Upload } from "lucide-react";
import axios from "axios";

interface AboutContent {
  _id: string;
  mainTitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
}

interface Stat {
  _id: string;
  label: string;
  value: number;
}

interface Value {
  _id: string;
  title: string;
  description: string;
}

const AboutSectionCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [aboutContent, setAboutContent] = useState<AboutContent>({
    _id: "",
    mainTitle: "",
    paragraph1: "",
    paragraph2: "",
    image: "",
  });

  const [stats, setStats] = useState<Stat[]>([
    { _id: "", label: "", value: 0 },
  ]);
  const [values, setValues] = useState<Value[]>([
    { _id: "", title: "", description: "" },
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/uploads/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        setAboutContent((prev) => ({
          ...prev,
          image: `${uploadedUrl}?v=${Date.now()}`,
        }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  const fetchAboutInfo = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/aboutSection/getAboutSec`
      );
      setAboutContent({
        _id: data._id || "",
        mainTitle: data.mainTitle || "",
        paragraph1: data.paragraph1 || "",
        paragraph2: data.paragraph2 || "",
        image: data.image || "",
      });
      setStats(data.stats || []);
      setValues(data.values || []);
    } catch (error) {
      console.error("Failed to fetch about section:", error);
    }
  };

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const payload = {
        mainTitle: aboutContent.mainTitle,
        paragraph1: aboutContent.paragraph1,
        paragraph2: aboutContent.paragraph2,
        image: aboutContent.image,
        stats,
        values,
      };

      await axios.put(
        `${import.meta.env.VITE_URL}/api/aboutSection/updateAboutSec/${
          aboutContent._id
        }`,
        payload
      );

      await fetchAboutInfo();
    } catch (error) {
      console.log("error occurred while saving about section", error);
    }
  };

  const updateStat = (index: number, field: string, value: any) => {
    const updatedStats = [...stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setStats(updatedStats);
  };

  const updateValue = (id: string, field: string, value: any) => {
    setValues(
      values.map((val) => (val._id === id ? { ...val, [field]: value } : val))
    );
  };

  return (
    <div className="space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <CardTitle>About Section Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Manage the about us content and company information
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              {/* Title & Paragraphs */}
              <div>
                <Label htmlFor="mainTitle">Main Title</Label>
                <Input
                  id="mainTitle"
                  value={aboutContent.mainTitle}
                  onChange={(e) =>
                    setAboutContent({
                      ...aboutContent,
                      mainTitle: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="paragraph1">First Paragraph</Label>
                <Textarea
                  id="paragraph1"
                  value={aboutContent.paragraph1}
                  onChange={(e) =>
                    setAboutContent({
                      ...aboutContent,
                      paragraph1: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="paragraph2">Second Paragraph</Label>
                <Textarea
                  id="paragraph2"
                  value={aboutContent.paragraph2}
                  onChange={(e) =>
                    setAboutContent({
                      ...aboutContent,
                      paragraph2: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="aboutImage">About Image</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
                  {uploading ? (
                    <p className="text-sm text-gray-500 mt-4">Uploading...</p>
                  ) : (
                    <img
                      src={aboutContent.image}
                      alt="About Preview"
                      className="w-full sm:w-40 h-auto rounded border shadow object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="aboutImage"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("aboutImage")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {aboutContent.mainTitle}
              </h3>
              <p className="text-muted-foreground">{aboutContent.paragraph1}</p>
              <p className="text-muted-foreground">{aboutContent.paragraph2}</p>
              <div className="w-full sm:w-48 h-40 bg-gray-200 rounded overflow-hidden">
                <img
                  src={aboutContent.image}
                  alt="About us"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle>Company Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={stat.value}
                      onChange={(e) =>
                        updateStat(index, "value", e.target.value)
                      }
                      placeholder="Value"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) =>
                        updateStat(index, "label", e.target.value)
                      }
                      placeholder="Label"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-estate-navy">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Values Section */}
      <Card>
        <CardHeader>
          <CardTitle>Core Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value) => (
              <Card key={value._id} className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={value.title}
                      onChange={(e) =>
                        updateValue(value._id, "title", e.target.value)
                      }
                      placeholder="Title"
                    />
                    <Textarea
                      value={value.description}
                      onChange={(e) =>
                        updateValue(value._id, "description", e.target.value)
                      }
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSectionCMS;
