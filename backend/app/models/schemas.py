"""Pydantic models for order form data validation."""

from typing import List, Optional, Union, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date
from pydantic import ConfigDict


class Contact(BaseModel):
    """Contact information model."""
    contact_type: Optional[str] = Field(
        None, description="Type of contact: 'DSP' or 'Accounts Payable'"
    )
    name: Optional[str] = None
    email: Optional[Union[EmailStr, str]] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    postal_code: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None  # 3-letter country code (e.g., USA, UK)


class BankAccount(BaseModel):
    """Bank account information model."""
    bank_name: Optional[str] = None
    routing_number: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[Literal["Checking", "Savings"]] = None


class BillingTerms(BaseModel):
    """Billing terms model."""
    model_config = ConfigDict(json_encoders={date: lambda v: v.isoformat() if v else None})

    initial_term_period: Optional[str] = None
    renewal_term_period: Optional[str] = None
    billing_frequency: Optional[str] = None
    initial_term_start_date: Optional[Union[date, str]] = None
    initial_term_end_date: Optional[Union[date, str]] = None
    estimated_employee_count: Optional[int] = None
    estimated_total_subscription_fee: Optional[float] = None
    one_time_setup_fee: Optional[float] = None

    @field_validator('initial_term_start_date', 'initial_term_end_date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str) and v:
            try:
                return date.fromisoformat(v)
            except ValueError:
                return v
        return v


class ClientModule(BaseModel):
    """Client module information model."""
    module_name: Optional[str] = None
    fee_per_unit: Optional[float] = None
    unit_type: Optional[
        Literal[
            "Per Employee Per Payroll",
            "Per Employee Per Year",
            "Per EIN Per Month",
            "Per Garnishment Per Payroll",
        ]
    ] = None
    units: Optional[int] = None
    subscription_fee: Optional[float] = None
    subscription_fee_frequency: Optional[Literal["Monthly", "Yearly"]] = None


class PlanCatalog(BaseModel):
    """Plan catalog details."""
    employee_range_min: Optional[int] = None
    employee_range_max: Optional[int] = None
    employee_range_label: Optional[str] = None
    one_time_implementation_fee: Optional[float] = None
    weekly_base_fee: Optional[float] = None
    weekly_per_check: Optional[float] = None
    biweekly_base_fee: Optional[float] = None
    biweekly_per_check: Optional[float] = None


class ClientSelectedPlan(BaseModel):
    """Client selected plan."""
    payroll_frequency: Optional[Literal["Weekly", "Bi-Weekly"]] = None
    selected_employee_range: Optional[str] = None
    employee_range_min: Optional[int] = None
    employee_range_max: Optional[int] = None


class Client(BaseModel):
    """Client information model."""
    dsp_name: Optional[str] = None
    dsp_code: Optional[str] = None
    dsp_fein: Optional[str] = None


class OrderFormData(BaseModel):
    """Complete order form data model."""
    client: Optional[Client] = None
    contacts: List[Contact] = Field(default_factory=list)
    billing_terms: Optional[BillingTerms] = None
    plan_catalog: List[PlanCatalog] = Field(default_factory=list)
    client_selected_plan: Optional[ClientSelectedPlan] = None
    add_on_modules: List[ClientModule] = Field(default_factory=list)
    bank_account: Optional[BankAccount] = None
    additional_notes: Optional[str] = None


class ExtractionResponse(BaseModel):
    """Response model for PDF extraction."""
    success: bool
    data: Optional[OrderFormData] = None
    message: Optional[str] = None
    raw_text: Optional[str] = None


class FinalSubmissionResponse(BaseModel):
    """Response model for final submission."""
    success: bool
    message: str
    submitted_data: OrderFormData
    submission_status: Optional[Literal["success", "retry", "info"]] = None
