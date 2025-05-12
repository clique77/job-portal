import { useState, useEffect } from 'react';
import { ResumeApi, Resume } from '../../../api/ResumeApi';
import './ResumePreview.scss';
import PDFViewer from '../PDFViewer/PDFViewer';

interface ResumePreviewProps {
  resumeId: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeId }) => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching resume with ID: ${resumeId}`);
        const response = await ResumeApi.getResumeById(resumeId);
        console.log('Resume fetch response:', response);
        setResume(response.resume);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError((err as Error).message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  if (loading) {
    return <div className="resume-preview-loading">Loading resume...</div>;
  }

  if (error) {
    return <div className="resume-preview-error">Error: {error}</div>;
  }

  if (!resume) {
    return <div className="resume-preview-error">Resume not found</div>;
  }

  return (
    <div className="resume-preview">
      <div className="resume-preview-header">
        <h3>{resume.fileName}</h3>
        <div className="resume-metadata">
          <span className="resume-size">{formatFileSize(resume.fileSize)}</span>
          <span className="resume-date">Uploaded on {formatDate(resume.uploadedAt)}</span>
        </div>
      </div>
      
      <div className="resume-preview-content">
        {resume.fileType === 'application/pdf' ? (
          <PDFViewer resumeId={resumeId} />
        ) : (
          <div className="unsupported-file-type">
            <p>This file type ({resume.fileType}) is not supported for preview.</p>
            <a 
              href={`/uploads/${resume.filePath}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="download-link"
            >
              Download Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default ResumePreview; 