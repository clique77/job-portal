import { IUserCompany, CompanyRole } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IUpdateUserCompanyRoleUseCase } from "./interfaces/IUserCompanyUseCase";

export class UpdateUserCompanyRole implements IUpdateUserCompanyRoleUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userCompanyId: string, role: CompanyRole, requesterId: string): Promise<IUserCompany | null> {
    // Get the relationship we're trying to update
    const userCompany = await this.userCompanyRepository.findById(userCompanyId);
    if (!userCompany) {
      throw new Error('UserCompany relationship not found');
    }

    // Get the requester's relationship with the company to check permissions
    const requesterRelation = await this.userCompanyRepository.findByUserAndCompany(
      requesterId,
      userCompany.companyId.toString()
    );

    // Verify requester has proper permissions (must be OWNER to change roles)
    if (!requesterRelation || requesterRelation.role !== CompanyRole.OWNER) {
      throw new Error('Unauthorized: Only the company owner can update member roles');
    }

    // Cannot demote company owner
    if (userCompany.role === CompanyRole.OWNER && role !== CompanyRole.OWNER) {
      throw new Error('Cannot change the role of the company owner');
    }

    return this.userCompanyRepository.update(userCompanyId, { role });
  }
} 