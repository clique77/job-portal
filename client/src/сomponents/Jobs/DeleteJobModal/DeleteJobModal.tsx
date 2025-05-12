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
  
  // Refs for focus management
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Store the currently focused element to restore focus when modal closes
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.classList.add('modal-open');
      
      // Move focus to the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      
      // Add keyboard event listener to close on escape key
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
          onCancel();
        }
      };
      
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Restore focus to the element that was focused before the modal opened
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
      onConfirm();
    } catch (err) {
      setError('An error occurred while deleting the job.');
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
          
          {error && <div className="error-message" role="alert">{error}</div>}
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