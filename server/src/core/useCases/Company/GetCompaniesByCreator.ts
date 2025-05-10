import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository } from "../../../data/repositories/Company/CompanyRepository";
import { IGetCompaniesByCreatorUseCase } from "./interfaces/ICompanyUseCase";

export class GetCompaniesByCreator implements IGetCompaniesByCreatorUseCase {
  private companyRepository: ICompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute(userId: string, page: number = 1, limit: number = 10): Promise<{
    companies: ICompany[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    
    const companies = await this.companyRepository.findByCreator(userId, skip, limit);
    const total = await this.companyRepository.count({ createdBy: userId });

    return {
      companies,
      total
    };
  }
} 