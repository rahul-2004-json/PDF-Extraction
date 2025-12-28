"""
API routes for order form extraction workflow.
"""
import os
import shutil
import uuid
import httpx
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional
from app.sheets.google_sheets import open_sheet

from app.models.schemas import (
    OrderFormData,
    ExtractionResponse,
    FinalSubmissionResponse
)

from app.services.pdf_extraction_service import PDFExtractionService
from app.core.config import settings


router = APIRouter(prefix="/order-form", tags=["order-form"])

@router.get("/sheet-title")
async def get_sheet_title():
    """
    Test endpoint to get Google Sheet title.
    """
    try:
        sheet = open_sheet(os.environ["GOOGLE_SHEET_ID"])
        return {"title":sheet.title}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing Google Sheet: {str(e)}"
        )


@router.post("/upload", response_model=ExtractionResponse)
async def upload_and_extract(file: UploadFile = File(...)):
    """
    Upload a PDF order form and extract information from it.
    
    Args:
        file: PDF file to upload
        
    Returns:
        ExtractionResponse: Extracted order form data
    """
    try:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(settings.allowed_extensions)}"
            )
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = settings.upload_folder / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            raw_text, structured_data = PDFExtractionService.extract_order_form_data(
                str(file_path),
                use_ai=True
            )
            
            try:
                order_form_data = OrderFormData(**structured_data)
            except Exception as e:
                return ExtractionResponse(
                    success=True,
                    data=None,
                    message=f"Extraction completed but validation failed: {str(e)}",
                    raw_text=raw_text[:1000] if len(raw_text) > 1000 else raw_text 
                )
            
            print(order_form_data)
            return ExtractionResponse(
                success=True,
                data=order_form_data,
                message="PDF extracted successfully",
                raw_text=None
            )
        finally:
            if file_path.exists():
                os.remove(file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )


@router.post("/submit", response_model=FinalSubmissionResponse)
async def submit_final_data(order_data: OrderFormData):
    try:
        sheet = open_sheet(os.environ["GOOGLE_SHEET_ID"])
        worksheet = sheet.sheet1
        from app.sheets.order_row_mapper import build_order_row
        row = build_order_row(order_data)
        worksheet.append_row(
            row,
            value_input_option="USER_ENTERED"
        )
        return FinalSubmissionResponse(
            success=True,
            message="Order data appended to Google Sheet successfully",
            submitted_data=order_data,
            submission_status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sheet insert failed: {repr(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "order-form-extraction"}



