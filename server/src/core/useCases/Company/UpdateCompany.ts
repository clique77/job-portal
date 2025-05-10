import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository, CompanyUpdateData } from "../../../data/repositories/Company/CompanyRepository";
import { IUpdateCompanyUseCase } from "./interfaces/ICompanyUseCase";
import { getUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { CompanyRole } from "../../../data/models/UserCompany";

export class UpdateCompany implements IUpdateCompanyUseCase {
  private companyRepository: ICompanyRepository;
  private userCompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
    this.userCompanyRepository = getUserCompanyRepository();
  }

  async execute(companyId: string, companyData: CompanyUpdateData, userId: string): Promise<ICompany | null> {
    // Verify that the user has appropriate permissions (owner or admin)
    const userCompany = await this.userCompanyRepository.findByUserAndCompany(userId, companyId);
    
    if (!userCompany || ![CompanyRole.OWNER, CompanyRole.ADMIN].includes(userCompany.role)) {
      throw new Error('Unauthorized: User does not have permission to update this company');
    }

    return this.companyRepository.update(companyId, companyData);
  }
} 