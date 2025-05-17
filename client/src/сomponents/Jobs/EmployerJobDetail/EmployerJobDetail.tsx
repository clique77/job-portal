import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { JOB_TYPE_LABELS, JobsApi } from '../../../api/JobsApi';
import CompanyApi from '../../../api/CompanyApi';
import JobApplicantsList from '../JobApplicantsList/JobApplicantsList';
import './EmployerJobDetail.scss';

interface JobDetails {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number
    currency: string;
  };
  type: string;
  category: string;
  tags: string[];
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  employer: string;
}

const EmployerJobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setIsLoading(true);
        const data = await JobsApi.getJobById(jobId);
        setJob(data.job);
        
        if (data.job.company && data.job.company.length === 24 && /^[0-9a-fA-F]{24}$/.test(data.job.company)) {
          try {
            const company = await CompanyApi.getCompanyById(data.job.company);
            if (company && company.name) {
              setCompanyName(company.name);
            } else {
              setCompanyName(data.job.company);
            }
          } catch (error) {
            console.error('Error fetching company details:', error);
            setCompanyName(data.job.company);
          }
        } else {
          setCompanyName(data.job.company);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch job details...');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const formatSalary = (salary: JobDetails['salary']) => {
    if (!salary) {
      return 'Salary not specified';
    }

    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  }

  const formatJobType = (type: string) => {
    return JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] || type;
  }

  if (isLoading) {
    return <div className="employer-job-detail__loading">Loading job details...</div>
  }

  if (error) {
    return <div className="employer-job-detail__error">{error}</div>
  }

  if (!job) {
    return <div className="employer-job-detail__not-found">Job not found</div>
  }

  return (
    <div className="employer-job-detail">
      <header className="employer-job-detail__header">
        <h1 className="employer-job-detail__title">{job.title || 'No Title'}</h1>
        <div className="employer-job-detail__company">{companyName || 'Company not specified'}</div>
        <div className="employer-job-detail__location">{job.location || 'Location not specified'}</div>
        <div className={`employer-job-detail__status employer-job-detail__status--${job.status.toLowerCase()}`}>
          Status: {job.status}
        </div>
      </header>

      <div className="employer-job-detail__content">
        <div className="employer-job-detail__info">
          <section className="employer-job-detail__section">
            <h2>Job Information</h2>
            
            <div className="employer-job-detail__field">
              <h3>Salary Range</h3>
              <p>{job.salary ? formatSalary(job.salary) : 'Salary not specified'}</p>
            </div>
            
            <div className="employer-job-detail__field">
              <h3>Job Type</h3>
              <p>{formatJobType(job.type) || 'Not specified'}</p>
            </div>
            
            <div className="employer-job-detail__field">
              <h3>Description</h3>
              <p>{job.description || 'No description available'}</p>
            </div>
            
            <div className="employer-job-detail__field">
              <h3>Requirements</h3>
              <p>{job.requirements || 'No requirements specified'}</p>
            </div>
            
            {job.tags && job.tags.length > 0 && (
              <div className="employer-job-detail__field">
                <h3>Skills/Tags</h3>
                <div className="employer-job-detail__tags">
                  {job.tags.map((tag, index) => (
                    <span key={index} className="employer-job-detail__tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
        
        <section className="employer-job-detail__applicants">
          <h2>Applicants</h2>
          {jobId ? <JobApplicantsList jobId={jobId} /> : <p>No job ID provided</p>}
        </section>
      </div>
    </div>
  );
};

export default EmployerJobDetail; 