import { useState, useEffect } from 'react';
import ApplicationApi from '../../../api/ApplicationApi';
import ResumeUpload from '../../Resume/ResumeUpload';
import './JobApplication.scss';

interface JobApplicationProps {
  jobId: string;
  jobTitle: string;
  company: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JobApplication: React.FC<JobApplicationProps> = ({
  jobId,
  jobTitle,
  company,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const status = await ApplicationApi.checkApplication(jobId);
        if (status?.hasApplied) {
          setHasApplied(true);
          onCancel?.();
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        setError('Failed to check application status');
      }
    };

    checkExistingApplication();
  }, [jobId, onCancel]);

  const handleSubmit = async () => {
    if (!resumeId) {
      setError('Please upload your resume');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await ApplicationApi.applyToJob(jobId, {
        notes: notes.trim(),
        resumeId: resumeId
      });

      if (response) {
        setIsSuccess(true);
        // Delay before closing to show success message
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit application');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (id: string) => {
    setResumeId(id);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (hasApplied) {
    return null;
  }

  return (
    <div className="job-application">
      <header className="job-application__header">
        <h2>Apply to {jobTitle}</h2>
        <p>{company}</p>
      </header>

      <div className="job-application__form">
        {error && (
          <div className="job-application__error">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="job-application__success">
            Application submitted successfully! Redirecting...
          </div>
        ) : (
          <>
            <ResumeUpload 
              onUploadSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />

            <textarea
              className="job-application__notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note to your application (optional)"
            />
            
            <div className="job-application__actions">
              <button 
                className="job-application__submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !resumeId}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button 
                className="job-application__cancel"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobApplication;