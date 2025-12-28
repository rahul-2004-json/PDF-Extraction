"""
Gemini AI service for structured data extraction.
Based on gemini_client.py logic.
"""
from google import genai
import os
from dotenv import load_dotenv
import json
import re
from typing import List, Dict, Optional
from google.genai import types

load_dotenv()
client = genai.Client()

def clean_gemini_response(raw_text: str) -> str:
    """
    Remove ```json code fences and extra whitespace from Gemini API response.
    """
    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)
    return cleaned.strip()


def split_text_into_chunks(text: str, chunk_size: int = 5000) -> List[str]:
    """
    Split long text into smaller chunks to fit into LLM input limits.
    """
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start+chunk_size])
        start += chunk_size
    return chunks


def merge_chunked_results(results: List[Dict]) -> Dict:
    """
    Merge JSON outputs from multiple chunks.
    Concatenate lists and keep first dict values for single-object tables.
    """
    final_result = {
        "client": None,
        "contacts": [],
        "bank_account": None,
        "billing_terms": None,
        "plan_catalog": [],
        "client_selected_plan": None,
        "add_on_modules": [],
        "additional_notes": None
    }

    for res in results:
        if final_result["client"] is None and res.get("client"):
            final_result["client"] = res["client"]

        if res.get("contacts"):
            final_result["contacts"].extend(res["contacts"])

        if final_result["bank_account"] is None and res.get("bank_account"):
            final_result["bank_account"] = res["bank_account"]

        if final_result["billing_terms"] is None and res.get("billing_terms"):
            final_result["billing_terms"] = res["billing_terms"]

        if res.get("plan_catalog"):
            final_result["plan_catalog"].extend(res["plan_catalog"])
        
        if final_result["client_selected_plan"] is None and res.get("client_selected_plan"):
            final_result["client_selected_plan"] = res["client_selected_plan"]

        if res.get("add_on_modules"):
            final_result["add_on_modules"].extend(res["add_on_modules"])
        
        if final_result["additional_notes"] is None and res.get("additional_notes"):
            final_result["additional_notes"] = res["additional_notes"]

    return final_result


def get_structured_response_chunked(text: str, chunk_size: int = 5000) -> Optional[dict]:
    """
    Extract structured JSON from long PDF text using Gemini API with chunking.
    """
    try:
        chunks = split_text_into_chunks(text, chunk_size)
        all_results = []

        for i, chunk in enumerate(chunks, 1):
            prompt = f"""
You are an AI that reads extracted text and tables fed to you. 
Understand the context of the text and tables.
Validate any missing information from both text and tables and fill.  
Extract all relevant information and return a **single JSON object** with the following fields:

1. client:
  - dsp_name
  - dsp_code
  - dsp_fein : Remove any extra spaces or special characters from the FEIN number.

2. contacts: list of contacts with:
  - contact_type: "DSP" or "Accounts Payable"
  - name
  - email
  - phone
  - city
  - address_line_1
  - address_line_2
  - postal_code
  - state
  - country : Interpret based on city ,state and give only 3 letter country code like USA, UK, etc.


3. bank_account: JSON object with the following fields:
  - bank_name
  - routing_number : Remove any extra spaces or special characters from the routing number.
  - account_number : Remove any extra spaces or special characters from the account number.
  - account_type : "Checking" or "Savings"

4. billing_terms:
  - initial_term_period (must be a string, e.g., "6 months")
  - renewal_term_period (must be a string, e.g., "6 months")
  - billing_frequency
  - initial_term_start_date
  - initial_term_end_date
  - estimated_employee_count
  - estimated_total_subscription_fee
  - one_time_setup_fee

5. plan_catalog: Array of objects with the following fields:
    - employee_range_min : for the 100+ bracket of the employee range keep lower limit minimum possible value as 101
    - employee_range_max : for the 100+ bracket of the employee range keep upper limit maximum possible value as 10000
    - employee_range_label : "01-50" or "51-100" or "100+" 
    - one_time_implementation_fee
    - weekly_base_fee
    - weekly_per_check
    - biweekly_base_fee
    - biweekly_per_check

6. client_selected_plan: JSON object with the following fields:
    "payroll_frequency": "Weekly" or "Bi-Weekly",
    "selected_employee_range": "01-50" or "51-100" or "100+",
    "employee_range_min": for the 100+ bracket of the employee range keep lower limit minimum possible value as 101
    "employee_range_max": for the 100+ bracket of the employee range keep upper limit maximum possible value as 10000

7. add_on_modules: list of optional modules with:
  - module_name
  - fee_per_unit
  - unit_type : "Per Employee Per Payroll" or "Per Employee Per Year" or "Per EIN Per Month" or "Per Garnishment Per Payroll" 
  - units
  - subscription_fee
  - subscription_fee_frequency : "Monthly" or "Yearly"

8. additional_notes: string field 
   - Place any additional notes or instructions here from the additional notes section in the PDF

**Important instructions:**
- Focus on bank account details present in the PDF, including account number, routing number, bank name, and account type.
- If bank account details are found in any part of the PDF, include them in the bank_account object. If no bank account information is found, set bank_account to null.
- Ensure numeric values (fees, counts) are numbers, not strings, EXCEPT for initial_term_period and renewal_term_period which must be strings.
- Ensure dates are in `YYYY-MM-DD` format and add 0 to the month and day if they are less than 10.
- If a field is missing, return null or empty list as appropriate.
- One time setup fee and one time implementation fee are two different things and should be extracted separately.
- There should be only two contacts in the contacts list - one DSP contact and one Accounts Payable contact. Please don't inlcude any additional contacts.
- Inside the plan_catalog add all the available plan details as listed
- Keep additional notes in the additional_notes field otherwise keep it empty
- Return only JSON, no explanations or extra text.


PDF text:
{chunk}
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
            )

            cleaned_text = clean_gemini_response(response.text)

            try:
                all_results.append(json.loads(cleaned_text))
            except json.JSONDecodeError:
                all_results.append({"raw_text": cleaned_text})

        final_result = merge_chunked_results(all_results)
        return final_result
    except Exception as e:
        print(f"Error in Gemini extraction: {str(e)}")
        return None

