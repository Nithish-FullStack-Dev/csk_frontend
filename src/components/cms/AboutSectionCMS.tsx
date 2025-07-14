import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  Eye,
  Upload,
  Building,
  Users,
  Award,
  Clock,
} from "lucide-react";

const AboutSectionCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutContent, setAboutContent] = useState({
    mainTitle: "About CSK Realtors",
    paragraph1:
      "With over 15 years of experience in real estate development, CSK Realtors has been at the forefront of creating exceptional residential and commercial spaces. Our commitment to quality, innovation, and customer satisfaction has made us a trusted name in the industry.",
    paragraph2:
      "We believe in building not just structures, but communities where families can thrive and businesses can prosper. Every project we undertake reflects our dedication to excellence and our vision of creating lasting value.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    valuesTitle: "Our Core Values",
  });

  const [stats, setStats] = useState([
    { icon: "Building", label: "Projects Completed", value: "150+" },
    { icon: "Users", label: "Happy Families", value: "2000+" },
    { icon: "Award", label: "Awards Won", value: "25+" },
    { icon: "Clock", label: "Years Experience", value: "15+" },
  ]);

  const [values, setValues] = useState([
    {
      id: 1,
      icon: "Award",
      title: "Quality Excellence",
      description:
        "We never compromise on quality, ensuring every project meets the highest standards.",
      color: "estate-gold",
    },
    {
      id: 2,
      icon: "Users",
      title: "Customer First",
      description:
        "Our customers are at the heart of everything we do, driving our commitment to service.",
      color: "estate-navy",
    },
    {
      id: 3,
      icon: "Building",
      title: "Innovation",
      description:
        "We embrace new technologies and methods to create better living experiences.",
      color: "estate-teal",
    },
  ]);

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saving about content:", { aboutContent, stats, values });
  };

  const updateStat = (index, field, value) => {
    const updatedStats = [...stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setStats(updatedStats);
  };

  const updateValue = (id, field, value) => {
    setValues(
      values.map((val) => (val.id === id ? { ...val, [field]: value } : val))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>About Section Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Manage the about us content and company information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
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

              <div>
                <Label htmlFor="aboutImage">About Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="aboutImage"
                    value={aboutContent.image}
                    onChange={(e) =>
                      setAboutContent({
                        ...aboutContent,
                        image: e.target.value,
                      })
                    }
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
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
              <div className="w-48 h-32 bg-gray-200 rounded overflow-hidden">
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

      {/* Stats Management */}
      <Card>
        <CardHeader>
          <CardTitle>Company Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Values Management */}
      <Card>
        <CardHeader>
          <CardTitle>Core Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {values.map((value) => (
              <Card key={value.id} className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={value.title}
                      onChange={(e) =>
                        updateValue(value.id, "title", e.target.value)
                      }
                      placeholder="Title"
                    />
                    <Textarea
                      value={value.description}
                      onChange={(e) =>
                        updateValue(value.id, "description", e.target.value)
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
