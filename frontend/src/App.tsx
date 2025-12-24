import { useState, useEffect, useRef } from 'react';
import PdfUpload from './components/PdfUpload/PdfUpload';
import OrderForm from './components/OrderForm/OrderForm';
import ConfirmationModel from './components/ConfirmationModal/ConfirmationModel';
import SubmissionResult from './components/SubmissionResult/SubmissionResult';
import { submitOrderForm } from './services/apiService';
import type { ExtractionResponse, OrderFormData, FinalSubmissionResponse } from './models/orderFormModel';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';
import logo from "./assets/images/uzio_logo.png";

type Step = 'upload' | 'form' | 'success';

const STORAGE_KEYS = {
  CURRENT_STEP: 'dsp_billing_current_step',
  EXTRACTED_DATA: 'dsp_billing_extracted_data',
  SUBMISSION_MESSAGE: 'dsp_billing_submission_message',
} as const;

export default function App() {
  const [title] = useState('Uzio DSP Billing');
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentStep, setCurrentStep] = useLocalStorage<Step>(
    STORAGE_KEYS.CURRENT_STEP,
    'upload'
  );
  const [extractedData, setExtractedData] = useLocalStorage<OrderFormData | undefined>(
    STORAGE_KEYS.EXTRACTED_DATA,
    undefined
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useLocalStorage<string>(
    STORAGE_KEYS.SUBMISSION_MESSAGE,
    ''
  );
  const [isSubmissionSuccess, setIsSubmissionSuccess] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'retry' | 'info'>('success');

  // Handle timeout warning for long submissions
  useEffect(() => {
    if (isLoading) {
      setShowTimeoutWarning(false);
      // Show warning after 10 seconds
      timeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 10000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowTimeoutWarning(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  const handleExtractionComplete = (response: ExtractionResponse) => {
    if (response.success && response.data) {
      setExtractedData(response.data);
      setCurrentStep('form');
    }
  };

  const handleFormSubmit = (orderData: OrderFormData) => {
    setExtractedData(orderData);
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmission = async () => {
    const orderData = extractedData;
    if (!orderData) return;

    setShowConfirmationModal(false);

    try {
      setIsLoading(true);
      const response: FinalSubmissionResponse = await submitOrderForm(orderData);
      setSubmissionMessage(response.message);
      setIsSubmissionSuccess(response.success);
      setSubmissionStatus(response.submission_status || (response.success ? 'success' : 'retry'));
      setCurrentStep('success');
      setExtractedData(undefined);
    } catch (error: any) {
      setSubmissionMessage(error.error?.detail || 'Submission failed. Please try again.');
      setIsSubmissionSuccess(false);
      setSubmissionStatus('retry');
      setCurrentStep('success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
  };

  const handleStartNewSubmission = () => {
    setCurrentStep('upload');
    setExtractedData(undefined);
    setSubmissionMessage('');
    window.location.reload();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <img src={logo} alt="Uzio Logo" className="app-logo" />
        </div>
        <div>
          <h1>{title}</h1>
        </div>
      </header>

      <main className="app-main">
        {currentStep !== 'success' && (
          <div className="step-indicator">
            <div className={`step ${currentStep === 'upload' ? 'active' : ''} ${currentStep === 'form' ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <span className="step-label">Upload PDF</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 'form' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span className="step-label">Review & Edit</span>
            </div>
          </div>
        )}

        <div className="content-area">
          {currentStep === 'upload' && (
            <PdfUpload onExtractionComplete={handleExtractionComplete} />
          )}

          {currentStep === 'form' && extractedData && (
            <OrderForm
              orderData={extractedData}
              onSubmit={handleFormSubmit}
              onDataChange={setExtractedData}
              onStartNew={handleStartNewSubmission}
            />
          )}

          {isLoading && (
            <div className="loading-overlay" role="status" aria-live="polite" aria-label="Submitting order form">
              <div className="loading-progress">
                <div className="spinner" aria-hidden="true"></div>
                <p>Submitting order form... Please wait...</p>
                {showTimeoutWarning && (
                  <p className="timeout-warning">
                    This is taking longer than usual. Please do not close this page.
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <SubmissionResult 
              message={submissionMessage}
              success={isSubmissionSuccess}
              submissionStatus={submissionStatus}
              onStartNew={handleStartNewSubmission} 
            />
          )}
        </div>
      </main>

      {showConfirmationModal && extractedData && (
        <ConfirmationModel
          orderData={extractedData}
          onConfirm={handleConfirmSubmission}
          onCancel={handleCancelConfirmation}
        />
      )}
    </div>
  );
}