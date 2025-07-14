
export type ConstructionPhase = 
  | "site_mobilization" 
  | "groundwork_foundation" 
  | "structural_framework" 
  | "slab_construction"
  | "masonry_work"
  | "roofing"
  | "internal_finishing"
  | "external_finishing"
  | "electrical_works"
  | "plumbing_works"
  | "hvac_works"
  | "fire_safety"
  | "project_management"
  | "snagging_rectification";

export interface ConstructionTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  phase: ConstructionPhase;
  status: "pending" | "in_progress" | "completed" | "delayed" | "on_hold";
  startDate: string;
  endDate: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  dependencies?: string[];
  attachments?: string[];
  comments?: {
    id: string;
    text: string;
    author: string;
    timestamp: string;
  }[];
}

export const CONSTRUCTION_PHASES = {
  site_mobilization: {
    title: "Site Mobilization and Setup",
    description: "Setting up the construction site with necessary infrastructure",
    tasks: [
      "Set up temporary utilities (water, electricity)",
      "Install security fencing and signage",
      "Establish site management and supervision teams"
    ]
  },
  groundwork_foundation: {
    title: "Groundwork and Foundation",
    description: "Excavation and foundation work",
    tasks: [
      "Excavation as per foundation design",
      "Piling (if required)",
      "Soil treatment (if required)",
      "Formwork for foundation",
      "Reinforcement (Steel Fixing)",
      "Concrete pouring for foundation",
      "Dewatering (if required)",
      "Backfilling"
    ]
  },
  structural_framework: {
    title: "Structural Framework",
    description: "Building the main structural elements",
    tasks: [
      "Formwork for columns and beams",
      "Reinforcement for columns and beams",
      "Concrete pouring for columns and beams",
      "Erection of pre-cast elements (if applicable)"
    ]
  },
  slab_construction: {
    title: "Slab Construction",
    description: "Creating floor and roof slabs",
    tasks: [
      "Formwork for slabs",
      "Reinforcement for slabs",
      "Conduiting and sleeves installation",
      "Concrete pouring for slabs",
      "Curing of concrete"
    ]
  },
  masonry_work: {
    title: "Masonry Work",
    description: "Construction of walls and partitions",
    tasks: [
      "Brickwork/Blockwork",
      "Lintel and sill installation",
      "Plastering (internal and external)"
    ]
  },
  roofing: {
    title: "Roofing",
    description: "Construction and finishing of roof structures",
    tasks: [
      "Roof structure construction",
      "Roof sheathing",
      "Waterproofing",
      "Installation of roofing materials",
      "Installation of gutters and downspouts"
    ]
  },
  internal_finishing: {
    title: "Finishing Works (Internal)",
    description: "Interior finishing and fixtures",
    tasks: [
      "Flooring installation",
      "Wall finishing",
      "Ceiling work",
      "Door and window installation",
      "Ironmongery installation",
      "Staircase construction and finishing",
      "Built-in furniture and fixtures"
    ]
  },
  external_finishing: {
    title: "Finishing Works (External)",
    description: "Exterior finishing and landscaping",
    tasks: [
      "External plastering and painting/cladding",
      "Facade installation",
      "Landscaping",
      "Paving and walkways",
      "Boundary walls and fencing"
    ]
  },
  electrical_works: {
    title: "Electrical Works",
    description: "Electrical systems installation",
    tasks: [
      "Conduiting and wiring",
      "Installation of electrical fixtures",
      "Earthing and grounding",
      "Installation of low-voltage systems",
      "Testing and commissioning of electrical systems"
    ]
  },
  plumbing_works: {
    title: "Plumbing Works",
    description: "Water supply and drainage systems",
    tasks: [
      "Installation of water supply pipes",
      "Installation of drainage pipes",
      "Installation of sanitary fixtures",
      "Installation of water heaters and pumps",
      "Testing and commissioning of plumbing systems"
    ]
  },
  hvac_works: {
    title: "HVAC Works",
    description: "Heating, ventilation, and air conditioning",
    tasks: [
      "Installation of ductwork",
      "Installation of HVAC units",
      "Refrigerant piping and connections",
      "Insulation of ductwork and piping",
      "Testing and commissioning of HVAC systems"
    ]
  },
  fire_safety: {
    title: "Fire Safety Systems",
    description: "Fire protection installations",
    tasks: [
      "Installation of fire sprinkler systems",
      "Installation of fire alarm systems",
      "Installation of fire extinguishers and other equipment",
      "Testing and commissioning of fire safety systems"
    ]
  },
  project_management: {
    title: "Project Management and Supervision",
    description: "Overseeing the construction process",
    tasks: [
      "Oversee construction activities",
      "Manage subcontractors and suppliers",
      "Monitor schedule and budget adherence",
      "Conduct site meetings",
      "Ensure safety compliance",
      "Maintain project documentation"
    ]
  },
  snagging_rectification: {
    title: "Snagging and Rectification",
    description: "Identifying and fixing defects",
    tasks: [
      "Conduct joint inspections",
      "Identify defects/snags",
      "Rectify identified issues",
      "Final client approval"
    ]
  }
};

export const SAMPLE_TASKS: ConstructionTask[] = [
  {
    id: "1",
    projectId: "1",
    title: "Foundation Excavation",
    description: "Excavate the site according to foundation plans to the specified depth.",
    phase: "groundwork_foundation",
    status: "completed",
    startDate: "2024-01-20",
    endDate: "2024-02-10",
    assignedTo: ["John Smith", "Excavation Team A"],
    createdBy: "Sarah Johnson",
    createdAt: "2024-01-15T08:30:00",
    updatedAt: "2024-02-11T14:20:00",
    progress: 100
  },
  {
    id: "2",
    projectId: "1",
    title: "Concrete Pouring - Ground Floor Columns",
    description: "Pour concrete for all ground floor columns according to structural specifications.",
    phase: "structural_framework",
    status: "in_progress",
    startDate: "2024-02-15",
    endDate: "2024-03-05",
    assignedTo: ["Robert Wilson", "Concrete Team B"],
    createdBy: "Michael Brown",
    createdAt: "2024-02-10T09:15:00",
    updatedAt: "2024-02-28T16:45:00",
    progress: 75
  },
  {
    id: "3",
    projectId: "2",
    title: "Site Fencing and Security Setup",
    description: "Install perimeter fencing, access gates, and security monitoring system.",
    phase: "site_mobilization",
    status: "completed",
    startDate: "2024-03-12",
    endDate: "2024-03-22",
    assignedTo: ["Security Team C"],
    createdBy: "Jennifer Martinez",
    createdAt: "2024-03-08T11:20:00",
    updatedAt: "2024-03-23T10:30:00",
    progress: 100
  },
  {
    id: "4",
    projectId: "2",
    title: "Electrical Wiring - First Floor",
    description: "Install main electrical conduits and wiring for the first floor of the building.",
    phase: "electrical_works",
    status: "pending",
    startDate: "2024-04-10",
    endDate: "2024-04-25",
    assignedTo: ["Electrical Team D", "David Lee"],
    createdBy: "Emily Davis",
    createdAt: "2024-03-28T14:45:00",
    updatedAt: "2024-03-28T14:45:00",
    progress: 0
  },
  {
    id: "5",
    projectId: "1",
    title: "Roof Structure Installation",
    description: "Erect main roof trusses and supporting structures.",
    phase: "roofing",
    status: "delayed",
    startDate: "2024-03-15",
    endDate: "2024-04-05",
    assignedTo: ["Roofing Team E", "Thomas Brown"],
    createdBy: "Michael Brown",
    createdAt: "2024-03-01T08:00:00",
    updatedAt: "2024-04-02T09:30:00",
    progress: 45,
    comments: [
      {
        id: "c1",
        text: "Delay due to material supply issues. New materials expected next week.",
        author: "Thomas Brown",
        timestamp: "2024-04-01T15:20:00"
      }
    ]
  }
];
