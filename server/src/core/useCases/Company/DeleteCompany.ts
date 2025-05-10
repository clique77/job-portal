import { ICompanyRepository } from "../../../data/repositories/Company/CompanyRepository";
import { IDeleteCompanyUseCase } from "./interfaces/ICompanyUseCase";
import { getUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { CompanyRole } from "../../../data/models/UserCompany";

export class DeleteCompany implements IDeleteCompanyUseCase {
  private companyRepository: ICompanyRepository;
  private userCompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
    this.userCompanyRepository = getUserCompanyRepository();
  }

  async execute(companyId: string, userId: string): Promise<boolean> {
    // Verify that the user is the owner
    const userCompany = await this.userCompanyRepository.findByUserAndCompany(userId, companyId);
    
    if (!userCompany || userCompany.role !== CompanyRole.OWNER) {
      throw new Error('Unauthorized: Only the company owner can delete the company');
    }

    return this.companyRepository.delete(companyId);
  }
} 