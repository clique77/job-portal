import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './DeleteJobModal.scss';

interface DeleteJobModalProps {
  isOpen: boolean;
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({ 
  isOpen, 
  jobTitle, 
  onConfirm, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.classList.add('modal-open');
      
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
          onCancel();
        }
      };
      
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleEscapeKey);
        
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, isLoading, onCancel]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onConfirm();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while deleting the job.';
      
      console.error('Error in DeleteJobModal:', errorMessage);
      setError(`Failed to delete job: ${errorMessage}`);
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !isOpen) {
    return null;
  }

  const modalContent = (
    <div className="delete-job-modal-container" role="dialog" aria-modal="true" aria-labelledby="delete-job-title">
      <div className="delete-job-modal-overlay" onClick={onCancel}></div>
      
      <div className="delete-job-modal">
        <div className="modal-header">
          <h3 id="delete-job-title">Delete Job Posting</h3>
          <button 
            className="close-btn" 
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close"
            ref={closeButtonRef}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <p>
            Are you sure you want to delete <strong>"{jobTitle}"</strong>?
          </p>
          
          <p className="warning-text">
            This action cannot be undone. All data related to this job posting will be permanently removed.
          </p>
          
          {error && (
            <div className="error-message" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {error}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-btn" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={isLoading}
            ref={confirmButtonRef}
          >
            {isLoading ? 'Deleting...' : 'Delete Job'}
          </button>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the document body level
  return createPortal(modalContent, document.body);
};

export default DeleteJobModal; 