import "./SubmissionResult.css";

interface SubmissionResultProps {
    message?: string;
    onStartNew: () => void;
    success?: boolean;
    submissionStatus?: 'success' | 'retry' | 'info';
}

export default function SubmissionResult({ 
    message = 'Order form data submitted successfully!', 
    onStartNew,
    success = true,
    submissionStatus
}: SubmissionResultProps) {
    const startNewSubmission = () => {
        if(onStartNew) {
            onStartNew();
        }
        else {
            window.location.reload();
        }
    };

    // Determine status type (use submissionStatus if provided, otherwise fallback to success/error)
    const statusType = submissionStatus || (success ? 'success' : 'error');

    // Get title based on status
    const getTitle = () => {
        switch (statusType) {
            case 'success':
                return 'Submission Successful';
            case 'retry':
                return 'Retry Upload';
            case 'info':
                return 'Information';
            default:
                return success ? 'Submission Successful' : 'Submission Failed';
        }
    };

    // Get button text based on status
    const getButtonText = () => {
        switch (statusType) {
            case 'success':
                return 'Start New Submission';
            case 'retry':
                return 'Try Again';
            case 'info':
                return 'Start New Submission';
            default:
                return success ? 'Start New Submission' : 'Try Again';
        }
    };

    // Render icon based on status
    const renderIcon = () => {
        switch (statusType) {
            case 'success':
                // Success icon (checkmark)
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                );
            case 'retry':
                // Retry icon (refresh/retry)
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                );
            case 'info':
                // Information icon (exclamation mark)
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                );
            default:
                // Error icon (X) - fallback
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                );
        }
    };

    return (
        <div className={`submission-container ${statusType}`}>
            <div className="submission-content">
                <div className={`submission-icon ${statusType}-icon`}>
                    {renderIcon()}
                </div>
                <h2>{getTitle()}</h2>
                <p className="submission-message">{message}</p>
                <button type="button" className="btn-new-submission" onClick={() => startNewSubmission()}>
                    {getButtonText()}
                </button>
            </div>
        </div>
    )
}

