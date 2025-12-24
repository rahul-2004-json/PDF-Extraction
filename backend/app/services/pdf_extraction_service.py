"""
PDF extraction service using pdfplumber library.
"""
import pdfplumber
from typing import Dict, Any, Tuple, Optional
from app.services.gemini_service import get_structured_response_chunked


class PDFExtractionService:
    """Service for extracting information from PDF order forms."""
    
    @staticmethod
    def extract_text_and_tables_from_pdf(file_path: str) -> str:
        """
        Extract all text and tables from a PDF file using pdfplumber,
        and combine them into a single text output suitable for processing.

        Args:
            file_path (str): Path to the PDF file.

        Returns:
            str: Combined text and table contents.
        """
        combined_text = []

        with pdfplumber.open(file_path) as pdf:
            for page_number, page in enumerate(pdf.pages, start=1):

                page_text = page.extract_text() or ""
                combined_text.append(f"\n=== PAGE {page_number} TEXT ===\n{page_text.strip()}\n")

                tables = page.extract_tables()
                for table_index, table in enumerate(tables, start=1):
                    if not table:
                        continue

                    combined_text.append(f"\n=== PAGE {page_number} TABLE {table_index} ===\n")

                    for row in table:
                        clean_row = [cell.strip() if cell else "" for cell in row]
                        combined_text.append(" | ".join(clean_row))
                    combined_text.append("\n")

        return "\n".join(combined_text)
    
    @staticmethod
    def get_default_structure() -> Dict[str, Any]:
        """
        Get default empty structure for order form data.
        Matches the OrderFormData schema structure.
        
        Returns:
            Dict[str, Any]: Default structured data dictionary
        """
        return {
            "client": {
                "dsp_name": None,
                "dsp_code": None,
                "dsp_fein": None
            },
            "contacts": [],
            "billing_terms": {
                "initial_term_period": None,
                "renewal_term_period": None,
                "billing_frequency": None,
                "initial_term_start_date": None,
                "initial_term_end_date": None,
                "estimated_employee_count": None,
                "estimated_total_subscription_fee": None,
                "one_time_setup_fee": None
            },
            "plan_catalog": [],
            "client_selected_plan": None,
            "add_on_modules": [],
            "bank_accounts": [],
            "additional_notes": None
        }
    
    @staticmethod
    def extract_order_form_data(file_path: str, use_ai: bool = True) -> Tuple[str, Dict[str, Any]]:
        """
        Extract order form data from PDF file.
        
        Args:
            file_path (str): Path to the PDF file
            use_ai (bool): Whether to use Gemini AI for structured extraction
            
        Returns:
            tuple: (raw_text, structured_data)
        """
        raw_text = PDFExtractionService.extract_text_and_tables_from_pdf(file_path)
        
        if use_ai:
            structured_data = get_structured_response_chunked(raw_text)
            if structured_data is None:
                structured_data = PDFExtractionService.get_default_structure()
        else:
            structured_data = PDFExtractionService.get_default_structure()
        
        return raw_text, structured_data

