import React, { useState, useEffect } from 'react';
import './DeleteCompanyModal.scss';

interface DeleteCompanyModalProps {
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const DeleteCompanyModal: React.FC<DeleteCompanyModalProps> = ({ 
  companyName, 
  onConfirm, 
  onCancel,
  isOpen 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm(), 300);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onCancel(), 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`delete-company-modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="delete-company-modal">
        <div className="modal-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>Delete Company</h2>
        
        <p>Are you sure you want to delete <span className="company-name">{companyName}</span>?</p>
        <p className="warning-text">This action cannot be undone and all associated data will be permanently removed.</p>
        
        <div className="modal-actions">
          <button 
            className="cancel-btn" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="delete-btn" 
            onClick={handleConfirm}
          >
            Delete Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCompanyModal; 