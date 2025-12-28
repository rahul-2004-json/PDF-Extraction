export interface Contact {
  contact_type?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  state?: string;
  country?: string; 
}

export interface BankAccount {
  bank_name?: string;
  routing_number?: string;
  account_number?: string;
  account_type?: 'Checking' | 'Savings';
}

export interface BillingTerms {
  initial_term_period?: string;
  renewal_term_period?: string;
  billing_frequency?: string;
  initial_term_start_date?: string | Date;
  initial_term_end_date?: string | Date;
  estimated_employee_count?: number;
  estimated_total_subscription_fee?: number;
  one_time_setup_fee?: number;
}

export interface PlanCatalog {
  employee_range_min?: number;
  employee_range_max?: number;
  employee_range_label?: string;
  one_time_implementation_fee?: number;
  weekly_base_fee?: number;
  weekly_per_check?: number;
  biweekly_base_fee?: number;
  biweekly_per_check?: number;
}

export interface ClientSelectedPlan {
  payroll_frequency?: 'Weekly' | 'Bi-Weekly';
  selected_employee_range?: string;
  employee_range_min?: number;
  employee_range_max?: number;
}

export interface AddOnModule {
  module_name?: string;
  fee_per_unit?: number;
  unit_type?: 'Per Employee Per Payroll' | 'Per Employee Per Year' | 'Per EIN Per Month' | 'Per Garnishment Per Payroll';
  units?: number;
  subscription_fee?: number;
  subscription_fee_frequency?: 'Monthly' | 'Yearly';
}

export interface Client {
  dsp_name?: string;
  dsp_code?: string;
  dsp_fein?: string;
}

export interface OrderFormData {
  client?: Client;
  contacts?: Contact[];
  billing_terms?: BillingTerms;
  plan_catalog?: PlanCatalog[];         
  client_selected_plan?: ClientSelectedPlan; 
  add_on_modules?: AddOnModule[];
  bank_account?: BankAccount;
  additional_notes?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: OrderFormData;
  message?: string;
  raw_text?: string;
}

export interface FinalSubmissionResponse {
  success: boolean;
  status: 'success' | 'retry' | 'info';
  message: string;
  submitted_data: OrderFormData;
}  
