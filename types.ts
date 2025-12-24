
export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export type CommissionType = string; // Changed from literal union to string to allow dynamic types

export interface CommissionStructure {
  own: number;
  office: number;
}

export const DEFAULT_COMMISSION_RATES: Record<string, CommissionStructure> = {
  'A': { own: 8, office: 4 },
  'B': { own: 10, office: 6 },
  'C': { own: 8, office: 6 }
};

export interface Employee {
  id: string;
  name: string;
  branch_id: string;
  designation: string;
  base_salary: number;
  commission_type: CommissionType;
}

export interface SalarySheet {
  id: string;
  month: string; // Format: "YYYY-MM"
  branch_ids: string[];
  created_at: string;
}

export interface SalaryEntry {
  id: string;
  salary_sheet_id: string;
  employee_id: string;
  
  // Manual Basic Salary (Defaults to Employee.base_salary but editable)
  basic_salary: number;
  
  // Row-specific Commission Type
  commission_type?: CommissionType;

  // Somity Info
  own_somity_count: number;
  own_somity_collection: number;
  
  office_somity_count: number;
  office_somity_collection: number;

  // New Center Info
  center_count: number;
  center_collection: number;
  
  // Loan Collection (Aggregated from Center Records)
  total_loan_collection: number;

  // Book Categories (Numbers represent value/points)
  book_1_5: number;
  book_3: number;
  book_5: number;
  book_8: number;
  book_10: number;
  book_12: number;
  book_no_bonus: number;

  // Deduction Inputs
  input_late_hours: number;
  input_absent_days: number;

  // Deductions (Monetary Values)
  deduction_cash_advance: number;
  deduction_late: number; // Calculated from input_late_hours
  deduction_abs: number;  // Calculated from input_absent_days
  misconductDeduction: number; // "অপকর্ম"
  deduction_unlawful: number;
  deduction_tours: number;
  deduction_others: number;

  // Calculations
  total_books: number;
  total_collection: number;
  total_deductions: number;
  commission: number;
  bonus: number;
  final_salary: number;
}

// Helper type for the grid view
export interface SalaryRow extends SalaryEntry {
  employee: Employee;
  branch: Branch;
}

export interface Book {
  id: number;
  code: string; // actual book ID
  term: number; // 1.5, 3, 5, 8, 10, 12
  owner_employee_id: string; // Changed to string to match Employee.id
  branch_id: string; // Changed to string to match Branch.id
  is_used: boolean;
  used_in_salary_sheet_id: string | null; // Changed to string to match SalarySheet.id
  used_month: string | null;
  created_at: string;
}

export interface AccountOpening {
  id: number;
  account_code: string;
  term: number; // 1.5, 3, 5, 8, 10, 12
  collection_amount: number; // New field for bonus validation
  opened_by_employee_id: string; // Changed to string to match Employee.id
  branch_id: string; // Changed to string to match Branch.id
  opening_date: string;
  is_counted: boolean;
  counted_month: string | null;
  salary_sheet_id: string | null; // Changed to string to match SalarySheet.id
}

export interface CenterCollectionRecord {
  id: string;
  branchId: string;
  employeeId: string;
  centerCode: number;
  amount: number; // Savings Collection
  loanAmount?: number; // Loan Collection (Optional)
  type: 'OWN' | 'OFFICE';
  createdAt: string;
}

export interface Center {
  id: string;
  centerCode: number;
  centerName: string;
  branchId: string;
  assignedEmployeeId: string;
  type?: 'OWN' | 'OFFICE'; // Optional for backward compatibility
}

// Authentication Types
export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  branch_id?: string; // If role is MANAGER or USER
  employee_id?: string; // If role is USER, link to their employee record for "My Accounts" view
  avatar?: string;
  password?: string; // For mock purposes
}
