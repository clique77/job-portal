import { CompanyRole } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { ICheckUserCompanyRoleUseCase } from "./interfaces/IUserCompanyUseCase";

export class CheckUserCompanyRole implements ICheckUserCompanyRoleUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userId: string, companyId: string, allowedRoles: CompanyRole[]): Promise<boolean> {
    return this.userCompanyRepository.checkUserRole(userId, companyId, allowedRoles);
  }
} 