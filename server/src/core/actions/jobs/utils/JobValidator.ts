import { JobCreateData, JobUpdateDTO } from '../../../../data/repositories/jobs/JobRepository';

export class JobValidator{
  validateJobData(jobData: JobCreateData): void {
    if (!jobData.title) {
      throw new Error('Title is required');
    }

    if (!jobData.description) {
      throw new Error('Description is required');
    }

    if (!jobData.employer) {
      throw new Error('Employer is required');
    }

    this.validateSalary(jobData);
  }

  validateJobUpdateData(jobData: JobUpdateDTO): void {
    if (jobData.title && jobData.title.length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (jobData.description && jobData.description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    this.validateSalary(jobData);
  }

  private validateSalary(jobData: JobUpdateDTO | JobCreateData): void {
    if (jobData.salary) {
      const { min, max } = jobData.salary;
      if (min && max && min > max) {
        throw new Error('Minimum salary cannot be greater than maximum salary');
      }
    }
  }
}
