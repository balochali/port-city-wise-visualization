export interface AgentData {
  agent: string;
  "20GP": number;
  "40HC": number;
  "20RF": number;
  "40RF": number;
  "20OT": number;
  "40OT": number;
  "20FR": number;
  "40FR": number;
  "20TK": number;
  "45HC": number;
  total: number;
}

export interface CityBlock {
  city: string;
  agents: AgentData[];
}

export interface TablesProps {
  cityData: CityBlock[];
  currentIndex: number;
  onCityChange: (index: number) => void;
  selectedCity: string;
}

export interface MapProps {
  selectedCity: string;
  cityData: CityBlock[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  error?: string;
}
