import apiClient from "./apiClient";

export interface Employee {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  email: string;
  role: string;
  department: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateEmployeeRequest {
  employee_code: string;
  employee_name: string;
  email: string;
  password: string;
  role: string;
  department?: string | null;
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>(
    "/api/employees"
  );

  return response.data;
}

export async function createEmployee(
  data: CreateEmployeeRequest
): Promise<Employee> {
  const response = await apiClient.post<Employee>("/api/employees", data);
  return response.data;
}