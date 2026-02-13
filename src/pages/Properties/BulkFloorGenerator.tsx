import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitMix {
  type: string;
  count: number;
}

interface UnitConfig {
  type: string;
  sqft: number;
  facing: string;
  thumbnail?: File | null;
  images?: File[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  buildingId: string;
}

const facingOptions = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export default function BulkFloorGenerator({
  open,
  onOpenChange,
  buildingId,
}: Props) {
  const queryClient = useQueryClient();

  const [floorCount, setFloorCount] = useState<number>(1);
  const [sameMix, setSameMix] = useState<boolean>(true);

  const [globalMix, setGlobalMix] = useState<UnitMix[]>([
    { type: "2BHK", count: 1 },
  ]);

  const [perFloorMix, setPerFloorMix] = useState<Record<number, UnitMix[]>>({});

  const [unitConfigs, setUnitConfigs] = useState<Record<string, UnitConfig>>(
    {},
  );

  // CREATE FLOOR
  const createFloor = async (payload: any) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_URL}/api/floor/createFloor`,
      payload,
      { withCredentials: true },
    );
    return data.data;
  };

  // CREATE UNIT
  const createUnit = async (payload: FormData) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_URL}/api/unit/createUnit`,
      payload,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.data;
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      for (let floor = 1; floor <= floorCount; floor++) {
        const mix = sameMix ? globalMix : perFloorMix[floor];

        // create floor
        const floorRes = await createFloor({
          buildingId,
          floorNumber: floor,
          unitType: "Mixed",
          totalSubUnits: mix.reduce((a, b) => a + b.count, 0),
          availableSubUnits: mix.reduce((a, b) => a + b.count, 0),
        });

        const floorId = floorRes._id;

        // create units
        for (const unit of mix) {
          const config = unitConfigs[unit.type];
          if (!config) {
            throw new Error(`Configuration missing for unit type ${unit.type}`);
          }

          for (let i = 1; i <= unit.count; i++) {
            const formData = new FormData();
            formData.append("buildingId", buildingId);
            formData.append("floorId", floorId);
            formData.append("plotNo", `${floor}-${unit.type}-${i}`);
            formData.append("unitType", unit.type);
            formData.append("extent", config.sqft.toString());
            formData.append("villaFacing", config.facing);

            if (config.thumbnail)
              formData.append("thumbnailUrl", config.thumbnail);

            config.images?.forEach((img) => formData.append("images", img));

            await createUnit(formData);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Floors & Units generated successfully");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Bulk generation failed"),
  });

  const addMixRow = () => setGlobalMix((p) => [...p, { type: "", count: 1 }]);

  const updateMix = (i: number, key: keyof UnitMix, val: any) => {
    const copy = [...globalMix];
    copy[i][key] = val;
    setGlobalMix(copy);
  };

  const configureUnitType = (type: string) => {
    if (!unitConfigs[type]) {
      setUnitConfigs({
        ...unitConfigs,
        [type]: { type, sqft: 0, facing: "" },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Floor & Unit Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Total Floors</Label>
            <Input
              type="number"
              value={floorCount}
              onChange={(e) => setFloorCount(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={sameMix} onCheckedChange={setSameMix} />
            <Label>Same unit mix for all floors</Label>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Unit Mix</h3>

              {globalMix.map((m, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Input
                    placeholder="Unit type (2BHK)"
                    value={m.type}
                    onChange={(e) => updateMix(i, "type", e.target.value)}
                  />
                  <Input
                    type="number"
                    value={m.count}
                    onChange={(e) =>
                      updateMix(i, "count", Number(e.target.value))
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setGlobalMix((p) => p.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}

              <Button onClick={addMixRow}>
                <Plus className="mr-2 h-4 w-4" /> Add Unit Type
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-6">
              <h3 className="font-semibold">Unit Configuration</h3>

              {globalMix.map((m, idx) => {
                const config = unitConfigs[m.type] || {
                  sqft: 0,
                  facing: "",
                };

                return (
                  <div key={idx} className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">{m.type}</h4>

                    <Input
                      placeholder="Sqft"
                      type="number"
                      value={config.sqft}
                      onChange={(e) =>
                        setUnitConfigs({
                          ...unitConfigs,
                          [m.type]: {
                            ...config,
                            sqft: Number(e.target.value),
                          },
                        })
                      }
                    />

                    <Select
                      value={config.facing}
                      onValueChange={(value) =>
                        setUnitConfigs({
                          ...unitConfigs,
                          [m.type]: {
                            ...config,
                            facing: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Facing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="East">East</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="North-East">North-East</SelectItem>
                        <SelectItem value="North-West">North-West</SelectItem>
                        <SelectItem value="South-East">South-East</SelectItem>
                        <SelectItem value="South-West">South-West</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setUnitConfigs({
                          ...unitConfigs,
                          [m.type]: {
                            ...config,
                            thumbnail: e.target.files?.[0],
                          },
                        })
                      }
                    />

                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setUnitConfigs({
                          ...unitConfigs,
                          [m.type]: {
                            ...config,
                            images: Array.from(e.target.files || []),
                          },
                        })
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
