import { CompanyRole } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IRemoveUserFromCompanyUseCase } from "./interfaces/IUserCompanyUseCase";

export class RemoveUserFromCompany implements IRemoveUserFromCompanyUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userId: string, companyId: string, requesterId: string): Promise<boolean> {
    // Get the relationship for the user to be removed
    const userCompany = await this.userCompanyRepository.findByUserAndCompany(userId, companyId);
    if (!userCompany) {
      throw new Error('User is not associated with this company');
    }

    // Cannot remove company owner
    if (userCompany.role === CompanyRole.OWNER) {
      throw new Error('Cannot remove the company owner');
    }

    // Get the requester's relationship to check permissions
    const requesterRelation = await this.userCompanyRepository.findByUserAndCompany(requesterId, companyId);

    // Verify permissions (must be OWNER or ADMIN, or removing self)
    const isRemovingSelf = userId === requesterId;
    const hasPermission = requesterRelation && 
      (requesterRelation.role === CompanyRole.OWNER || 
       requesterRelation.role === CompanyRole.ADMIN);
    
    if (!isRemovingSelf && !hasPermission) {
      throw new Error('Unauthorized: Insufficient permissions to remove users');
    }

    return this.userCompanyRepository.delete(userCompany.id);
  }
} 