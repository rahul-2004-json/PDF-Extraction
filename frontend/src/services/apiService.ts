import type {
    ExtractionResponse,
    FinalSubmissionResponse,
    OrderFormData
} from "../models/orderFormModel"
  
// Base URL backend - reads from environment variable
// Set VITE_API_BASE_URL in .env file
// For production: VITE_API_BASE_URL=https://pdf-extraction-y5zt.onrender.com/order-form
// For local dev: VITE_API_BASE_URL=http://localhost:8001/order-form
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/order-form";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "API Error");
    }
    return response.json() as Promise<T>;
}
  
 
export async function uploadPdf(file: File): Promise<ExtractionResponse> {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  
    return handleResponse<ExtractionResponse>(response);
}
  
 
export async function submitOrderForm(
    orderData: OrderFormData
  ): Promise<FinalSubmissionResponse> {
  
    const response = await fetch(`${BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
  
    return handleResponse<FinalSubmissionResponse>(response);
}
  
export async function healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${BASE_URL}/health`);
    return handleResponse<{ status: string; service: string }>(response);
}

  
