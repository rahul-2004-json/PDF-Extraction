import os
import json
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def _get_credentials():
    """
    Get Google service account credentials from environment variable or file.
    
    Priority:
    1. GOOGLE_SERVICE_ACCOUNT_JSON environment variable (for production/deployment)
    2. google_service_account.json file (for local development)
    
    Returns:
        Credentials: Google service account credentials
    """
    # Try to load from environment variable first (recommended for production)
    service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    
    if service_account_json:
        # Parse JSON from environment variable
        try:
            service_account_info = json.loads(service_account_json)
            return Credentials.from_service_account_info(
                service_account_info,
                scopes=SCOPES
            )
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
    
    # Fall back to file (for local development)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    service_account_file = os.path.join(BASE_DIR, 'google_service_account.json')
    
    if os.path.exists(service_account_file):
        return Credentials.from_service_account_file(
            str(service_account_file),
            scopes=SCOPES
        )
    
    raise FileNotFoundError(
        "Google service account credentials not found. "
        "Either set GOOGLE_SERVICE_ACCOUNT_JSON environment variable "
        "or place google_service_account.json in the sheets directory."
    )


def open_sheet(spreadsheet_id: str) -> gspread.Spreadsheet:
    """
    Open a Google Sheet by its ID.
    
    Args:
        spreadsheet_id: The ID of the Google Spreadsheet
        
    Returns:
        gspread.Spreadsheet: The opened spreadsheet
    """
    creds = _get_credentials()
    client = gspread.authorize(creds)
    return client.open_by_key(spreadsheet_id)
