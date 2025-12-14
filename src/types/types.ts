export interface AgentData {
  agent: string;
  values: number[];
  total: number;
}

export interface CityBlock {
  city: string;
  agents: AgentData[];
}

export interface TablesProps {
  cityData: CityBlock[];
}

export interface MapProps {
  selectedCity: string;
  cityData: Array<{
    city: string;
    agents: Array<{
      agent: string;
      values: number[];
      total: number;
    }>;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}
