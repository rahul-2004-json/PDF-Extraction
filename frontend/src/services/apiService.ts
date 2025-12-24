import type {
    ExtractionResponse,
    FinalSubmissionResponse,
    OrderFormData
} from "../models/orderFormModel"
  
// Base URL backend
const BASE_URL = "http://localhost:8001/order-form";   // Use when running backend and frontend on different ports
// const BASE_URL = "/order-form";                    // Uncomment this when running backend and frontend on the same port

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
  