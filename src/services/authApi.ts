import axios from "axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  email: string;
  role: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `/api/auth/login`,
    data
  );

  return response.data;
}