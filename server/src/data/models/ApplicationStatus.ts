export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  INTERVIEWED = 'INTERVIEWED',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  WITHDRAWN = 'WITHDRAWN'
}

export const validStatusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.PENDING]: [
    ApplicationStatus.REVIEWING,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.REVIEWING]: [
    ApplicationStatus.INTERVIEWED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.INTERVIEWED]: [
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.OFFERED]: [
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.HIRED]: [
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.WITHDRAWN]: []
};
