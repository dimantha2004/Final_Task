export enum Department {
  HR = 'HR',
  IT = 'IT',
  FINANCE = 'FINANCE',
  OPERATIONS = 'OPERATIONS'
}

export interface Employee {
  id?: number;
  name: string;
  email: string;
  department: Department;
  createdAt?: string;
  updatedAt?: string;
}