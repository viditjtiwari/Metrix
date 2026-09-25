export interface PhysicalInspectionChecklist {
  seal_intact: boolean;
  display_readable: boolean;
  leveling_ok: boolean;
  power_stable: boolean;
  overall_condition: "Good" | "Fair" | "Poor";
  remarks?: string;
}

export interface SpanTestPoint {
  load_percentage: number;
  standard_value: string;
  observed_value: string;
  error?: string;
  mpe_limit?: string;
  is_passed: boolean;
}

export interface MetrologicalTestData {
  zero_error_expected?: string;
  zero_error_observed?: string;
  zero_error_passed: boolean;
  span_tests: SpanTestPoint[];
  eccentricity_passed: boolean;
  discrimination_passed: boolean;
  repeatability_passed: boolean;
}

export interface InspectionChecklistSubmit {
  physical_inspection: PhysicalInspectionChecklist;
  metrological_tests?: MetrologicalTestData;
  observations?: {
    parameter_name: string;
    observed_value: string;
    standard_value?: string;
    unit?: string;
    is_passed: boolean;
    remarks?: string;
  }[];
  seal_number?: string;
  result: "VERIFIED" | "REJECTED";
  result_remarks?: string;
}
