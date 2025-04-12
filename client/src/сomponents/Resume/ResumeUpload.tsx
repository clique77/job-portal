import { useState } from 'react';
import { ResumeApi } from '../../api/ResumeApi';

import './ResumeUpload.scss';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: string) => void;
  onError?: (error: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError?.('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError?.('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('file', file);

      const response = await ResumeApi.uploadResume(formData);
      onUploadSuccess?.(response.resume._id);
      setUploadStatus('success');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred');
      setUploadStatus('idle');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
  };

  return (
    <div className="resume-upload">
      <div className="resume-upload__input-group">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="resume-upload__file-input"
          disabled={isUploading}
        />
        <div
          className={`resume-upload__dropzone ${isDragging ? 'dragging' : ''} ${uploadStatus === 'success' ? 'success' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadStatus === 'idle' && (
            <>
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Drag & drop your resume here</p>
              <p>or</p>
              <p><strong>Click to browse</strong></p>
              <p className="resume-upload__hint">Supported format: PDF</p>
            </>
          )}

          {uploadStatus === 'uploading' && (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Uploading resume...</p>
              {selectedFile && (
                <p className="resume-upload__hint">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              )}
            </>
          )}

          {uploadStatus === 'success' && (
            <>
              <i className="fas fa-check-circle"></i>
              <p>Resume uploaded successfully!</p>
              {selectedFile && (
                <p className="resume-upload__hint">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              )}
              <button 
                className="resume-upload__change-button"
                onClick={handleReset}
              >
                Upload a different resume
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;