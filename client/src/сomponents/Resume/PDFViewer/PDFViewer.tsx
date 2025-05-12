import { useState, useEffect } from 'react';
import { ResumeApi } from '../../../api/ResumeApi';
import './PDFViewer.scss';

// Define a type guard for resumeId object
interface ResumeIdObject {
  _id: string;
}

function isResumeIdObject(value: any): value is ResumeIdObject {
  return value && typeof value === 'object' && '_id' in value && typeof value._id === 'string';
}

interface PDFViewerProps {
  resumeId: string | ResumeIdObject | undefined;
  onError?: (error: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ resumeId, onError }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) {
        setError('No resume ID provided');
        if (onError) onError('No resume ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`PDFViewer: Fetching resume with ID:`, resumeId);
        
        // Handle case where resumeId might be an object
        let resumeIdString: string;
        if (isResumeIdObject(resumeId)) {
          resumeIdString = resumeId._id;
        } else if (typeof resumeId === 'string') {
          resumeIdString = resumeId;
        } else {
          resumeIdString = String(resumeId);
        }
          
        console.log(`PDFViewer: Converted resumeId to: ${resumeIdString}`);
        
        const response = await ResumeApi.getResumeById(resumeIdString);
        console.log('PDFViewer: Resume fetch response:', response);
        
        if (!response.resume) {
          throw new Error('Resume data not found in response');
        }
        
        // Handle filepath correctly - the file might be stored with the full path or just the filename
        const fileName = response.resume.filePath.includes('/')
          ? response.resume.filePath.split('/').pop()
          : response.resume.filePath;
          
        const url = `${API_BASE_URL}/uploads/${fileName}`;
        console.log('PDFViewer: PDF URL for viewer:', url);
        setPdfUrl(url);
      } catch (err) {
        console.error('PDFViewer: Error fetching resume:', err);
        const errorMessage = (err as Error).message || 'Failed to load resume';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, onError]);

  if (loading) {
    return <div className="pdf-viewer-loading">Loading PDF...</div>;
  }

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>Error loading PDF: {error}</p>
        <p>Please try again or contact support.</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return <div className="pdf-viewer-error">Unable to load PDF</div>;
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-header">
        <div className="header-title">PDF Document</div>
        <div className="header-actions">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="download-button"
          >
            Open in New Tab
          </a>
        </div>
      </div>
      <div className="pdf-viewer-frame">
        {/* Using object tag for better PDF support */}
        <object
          data={pdfUrl}
          type="application/pdf"
          className="pdf-viewer-object"
          width="100%"
          height="100%"
        >
          <p>
            It appears your browser doesn't support embedded PDFs.
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Click here to view the PDF directly
            </a>
          </p>
          {/* Fallback to iframe if object tag doesn't work */}
          <iframe 
            src={pdfUrl}
            className="pdf-viewer-iframe"
            title="PDF Viewer"
            loading="lazy"
            width="100%"
            height="100%"
          />
        </object>
      </div>
    </div>
  );
};

export default PDFViewer; 