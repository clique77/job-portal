import { useState, useEffect } from 'react';
import { User, UserApi } from '../../../api/UserApi';
import { toast } from 'react-toastify';
import './WorkExperienceForm.scss';

interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

interface WorkExperienceFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({ user, onUpdate }) => {
  const [experiences, setExperiences] = useState<WorkExperience[]>(
    user.workExperience || []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState<WorkExperience>({
    company: '',
    position: '',
    startDate: new Date(),
    current: false,
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState<{
    endDate?: string;
  }>({});

  // Format date for input
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    
    try {
      // Create a new date to avoid timezone issues
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (err) {
      console.error("Error formatting date:", err);
      return '';
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: { endDate?: string } = {};
    
    if (!newExperience.current && newExperience.endDate) {
      // Check if end date is before start date
      if (new Date(newExperience.endDate) < new Date(newExperience.startDate)) {
        errors.endDate = "End date cannot be earlier than start date";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset validation errors when form values change
  useEffect(() => {
    if (validationErrors.endDate && !newExperience.current) {
      // Re-validate end date when it changes
      if (newExperience.endDate && new Date(newExperience.endDate) >= new Date(newExperience.startDate)) {
        setValidationErrors({});
      }
    }
  }, [newExperience.endDate, newExperience.startDate, newExperience.current, validationErrors.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create a copy to avoid mutating the original state
      const experienceToSubmit = {...newExperience};
      
      if (experienceToSubmit.current) {
        delete experienceToSubmit.endDate;
      }
      
      const updatedExperiences = [...experiences, experienceToSubmit];
      const updatedUser = await UserApi.updateUserProfile({
        ...user,
        workExperience: updatedExperiences
      });
      
      setExperiences(updatedExperiences);
      onUpdate(updatedUser);
      setIsAdding(false);
      setNewExperience({
        company: '',
        position: '',
        startDate: new Date(),
        current: false,
        description: ''
      });
      setValidationErrors({});
      toast.success('Work experience added successfully');
    } catch (error) {
      toast.error('Failed to add work experience');
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      const updatedUser = await UserApi.updateUserProfile({
        ...user,
        workExperience: updatedExperiences
      });
      
      setExperiences(updatedExperiences);
      onUpdate(updatedUser);
      toast.success('Work experience deleted successfully');
    } catch (error) {
      toast.error('Failed to delete work experience');
    }
  };

  // Handler for date changes
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (!value) {
      if (field === 'startDate') {
        // If start date is cleared, set to today
        setNewExperience({...newExperience, startDate: new Date()});
      } else {
        // If end date is cleared, remove it
        const updated = {...newExperience};
        delete updated.endDate;
        setNewExperience(updated);
      }
      return;
    }
    
    try {
      const dateValue = new Date(value);
      
      // Check that the date is valid
      if (!isNaN(dateValue.getTime())) {
        setNewExperience({...newExperience, [field]: dateValue});
      }
    } catch (error) {
      console.error(`Error parsing date ${value}:`, error);
    }
  };

  return (
    <div className="work-experience-form">
      <div className="work-experience-list">
        {experiences.map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <h3>{exp.position}</h3>
              <button
                className="delete-btn"
                onClick={() => handleDelete(index)}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
            <p className="company">{exp.company}</p>
            <p className="dates">
              {new Date(exp.startDate).toLocaleDateString()} - 
              {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
            </p>
            <p className="description">{exp.description}</p>
          </div>
        ))}
      </div>

      <button
        className="add-experience-btn"
        onClick={() => setIsAdding(true)}
        type="button"
      >
        + Add Work Experience
      </button>

      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsAdding(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2>Add Work Experience</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group company-field">
                <label>
                  Company
                </label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={e => setNewExperience({...newExperience, company: e.target.value})}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="form-group position-field">
                <label>
                  Position
                </label>
                <input
                  type="text"
                  value={newExperience.position}
                  onChange={e => setNewExperience({...newExperience, position: e.target.value})}
                  placeholder="Enter your position"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(newExperience.startDate)}
                  onChange={e => handleDateChange('startDate', e.target.value)}
                  max={!newExperience.current && newExperience.endDate ? formatDateForInput(newExperience.endDate) : undefined}
                  required
                />
              </div>
              <div className="form-group checkbox-container">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="currentJob"
                    checked={newExperience.current}
                    onChange={e => setNewExperience({...newExperience, current: e.target.checked})}
                  />
                  <label htmlFor="currentJob">I currently work here</label>
                </div>
              </div>
              {!newExperience.current && (
                <div className={`form-group ${validationErrors.endDate ? 'has-error' : ''}`}>
                  <label>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(newExperience.endDate)}
                    onChange={e => handleDateChange('endDate', e.target.value)}
                    min={formatDateForInput(newExperience.startDate)}
                  />
                  {validationErrors.endDate && (
                    <div className="error-message">{validationErrors.endDate}</div>
                  )}
                </div>
              )}
              <div className="form-group">
                <label>
                  Description
                </label>
                <textarea
                  value={newExperience.description}
                  onChange={e => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your responsibilities and achievements"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Save
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperienceForm; 