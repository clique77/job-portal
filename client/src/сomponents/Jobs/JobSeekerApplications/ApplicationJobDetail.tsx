import React from 'react';
import JobDetails from '../JobDetail/JobDetail';
import './ApplicationJobDetail.scss';

interface ApplicationJobDetailProps {
  jobId: string;
  isPending: boolean;
  onWithdraw: () => void;
}

const ApplicationJobDetail: React.FC<ApplicationJobDetailProps> = ({
  jobId,
  isPending,
  onWithdraw
}) => {
  return (
    <div className="application-job-detail">
      <div className="job-details-container">
        <JobDetails jobId={jobId} />
      </div>
      
      {isPending && (
        <div className="withdraw-application-container">
          <button 
            className="withdraw-application-btn"
            onClick={onWithdraw}
          >
            Withdraw Application
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationJobDetail; 