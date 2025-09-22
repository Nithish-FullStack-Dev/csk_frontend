import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, Upload, Plus, Trash2 } from "lucide-react";
import axios from "axios";

interface AboutContent {
  _id: string;
  mainTitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  teamTitle: string;
  teamDes: string;
  thumbnail: string;
  videoUrl: string;
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

interface TeamMember {
  _id?: string;
  key: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  uploading?: boolean; // loader for each member
}

const AboutSectionCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false); // About image loader
  const [thumbnailUploading, setThumbnailUploading] = useState(false); // Thumbnail loader

  const [aboutContent, setAboutContent] = useState<AboutContent>({
    _id: "",
    mainTitle: "",
    paragraph1: "",
    paragraph2: "",
    image: "",
    teamTitle: "",
    teamDes: "",
    thumbnail: "",
    videoUrl: "",
  });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [values, setValues] = useState<Value[]>([]);

  // Fetch about section from API
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
        teamTitle: data.teamTitle || "",
        teamDes: data.teamDes || "",
        thumbnail: data.thumbnail || "",
        videoUrl: data.videoUrl || "",
      });
      setStats(data.stats || []);
      setValues(data.values || []);
      setTeam(
        (data.team || []).map(
          (member: Omit<TeamMember, "key" | "uploading">) => ({
            ...member,
            key:
              member._id ||
              `fetched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            uploading: false,
          })
        )
      );
    } catch (error) {
      console.error("Failed to fetch about section:", error);
    }
  };

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  // About section image upload
  const handleAboutImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  // Thumbnail image upload
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);

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
          thumbnail: `${uploadedUrl}?v=${Date.now()}`,
        }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
      setThumbnailUploading(false);
    }
  };

  // Team member image upload
  const handleTeamImageUpload = async (key: string, file: File) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.key === key ? { ...member, uploading: true } : member
      )
    );

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
        setTeam((prev) =>
          prev.map((member) =>
            member.key === key
              ? { ...member, image: uploadedUrl, uploading: false }
              : member
          )
        );
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setTeam((prev) =>
        prev.map((member) =>
          member.key === key ? { ...member, uploading: false } : member
        )
      );
    }
  };

  // Update functions
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

  const updateTeamMember = (key: string, field: string, value: any) => {
    setTeam(
      team.map((member) =>
        member.key === key ? { ...member, [field]: value } : member
      )
    );
  };

  const addTeamMember = () => {
    setTeam((prev) => [
      ...prev,
      {
        key: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: "",
        role: "",
        image: "",
        bio: "",
        uploading: false,
      },
    ]);
  };

  const removeTeamMember = (key: string) => {
    setTeam((prev) => prev.filter((member) => member.key !== key));
  };

  // Save all changes
  const handleSave = async () => {
    setIsEditing(false);
    try {
      const teamPayload = team.map(({ uploading, key, _id, ...rest }) => rest);

      const payload = {
        mainTitle: aboutContent.mainTitle,
        paragraph1: aboutContent.paragraph1,
        paragraph2: aboutContent.paragraph2,
        image: aboutContent.image,
        teamTitle: aboutContent.teamTitle,
        teamDes: aboutContent.teamDes,
        thumbnail: aboutContent.thumbnail,
        videoUrl: aboutContent.videoUrl,
        stats,
        values,
        team: teamPayload,
      };

      await axios.put(
        `${import.meta.env.VITE_URL}/api/aboutSection/updateAboutSec/${
          aboutContent._id
        }`,
        payload
      );

      await fetchAboutInfo();
    } catch (error) {
      console.error("Error saving about section:", error);
    }
  };

  const isAnyUploading =
    uploading || thumbnailUploading || team.some((member) => member.uploading);

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
              <Button onClick={handleSave} size="sm" disabled={isAnyUploading}>
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
                    onChange={handleAboutImageUpload}
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
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
                  {thumbnailUploading ? (
                    <p className="text-sm text-gray-500 mt-4">Uploading...</p>
                  ) : (
                    <img
                      src={aboutContent.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full sm:w-40 h-auto rounded border shadow object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="thumbnail"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("thumbnail")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Thumbnail
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={aboutContent.videoUrl}
                  onChange={(e) =>
                    setAboutContent({
                      ...aboutContent,
                      videoUrl: e.target.value,
                    })
                  }
                />
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
              <div className="w-full sm:w-48 h-40 bg-gray-200 rounded overflow-hidden">
                <img
                  src={aboutContent.thumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-muted-foreground">
                Video URL: {aboutContent.videoUrl}
              </p>
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

      {/* Team Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <CardTitle>Our Team</CardTitle>
            {isEditing ? (
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="teamTitle">Team Title</Label>
                  <Input
                    id="teamTitle"
                    value={aboutContent.teamTitle}
                    onChange={(e) =>
                      setAboutContent({
                        ...aboutContent,
                        teamTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="teamDes">Team Description</Label>
                  <Textarea
                    id="teamDes"
                    value={aboutContent.teamDes}
                    onChange={(e) =>
                      setAboutContent({
                        ...aboutContent,
                        teamDes: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                <h3 className="text-xl font-semibold">
                  {aboutContent.teamTitle}
                </h3>
                <p className="text-muted-foreground">{aboutContent.teamDes}</p>
              </div>
            )}
          </div>
          {isEditing && (
            <Button onClick={addTeamMember} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <Card key={member.key} className="p-4 flex flex-col">
                {isEditing ? (
                  <div className="space-y-3">
                    {/* Upload image */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                        {member.uploading ? (
                          <div className="flex items-center justify-center h-full text-xs text-gray-500">
                            Uploading...
                          </div>
                        ) : (
                          member.image && (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          )
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id={`team-image-${member.key}`}
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleTeamImageUpload(member.key, e.target.files[0])
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`team-image-${member.key}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>

                    {/* Name */}
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) =>
                          updateTeamMember(member.key, "name", e.target.value)
                        }
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={member.role}
                        onChange={(e) =>
                          updateTeamMember(member.key, "role", e.target.value)
                        }
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={member.bio}
                        onChange={(e) =>
                          updateTeamMember(member.key, "bio", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTeamMember(member.key)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200">
                      {member.image && (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                    <p className="text-xs text-gray-500">{member.bio}</p>
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
