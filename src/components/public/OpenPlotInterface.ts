export interface OpenPlot {
  _id?: string
  createdAt?: string
  updatedAt?: string

  // Project Info
  projectName: string
  openPlotNo: string
  surveyNo?: string
  location?: string

  // Plot Layout Details
  totalArea?: number
  areaUnit?: string
  roadWidthFt?: number
  boundaries?: string

  // Legal
  approvalAuthority?: "DTCP" | "HMDA" | "Panchayat" | "Municipality" | "Unapproved" | "Other"
  titleStatus?: string
  reraNo?: string
  documentNo?: string

  // Plot Info
  facing?: "North" | "East" | "West" | "South" | "North-East" | "North-West" | "South-East" | "South-West"
  plotType?: "Residential" | "Commercial" | "Agricultural" | "Industrial"

  // Status
  status?: "Available" | "Sold" | "Reserved" | "Blocked" | "Under Dispute"

  // Media
  thumbnailUrl?: string
  images?: string[]
  brochureUrl?: string

  // Map
  googleMapsLocation?: string

  // Extra
  remarks?: string
}