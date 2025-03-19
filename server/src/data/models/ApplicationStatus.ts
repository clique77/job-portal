export enum ApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED'
}

export const validStatusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.PENDING]: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.REJECTED
  ],
  [ApplicationStatus.UNDER_REVIEW]: [
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.REJECTED
  ],
  [ApplicationStatus.INTERVIEW_SCHEDULED]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED
  ],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.ACCEPTED]: []
};
