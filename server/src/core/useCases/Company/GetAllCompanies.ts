import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository, CompanyFilter } from "../../../data/repositories/Company/CompanyRepository";
import { IGetAllCompaniesUseCase } from "./interfaces/ICompanyUseCase";

export class GetAllCompanies implements IGetAllCompaniesUseCase {
  private companyRepository: ICompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute(page: number = 1, limit: number = 10, filter?: CompanyFilter): Promise<{
    companies: ICompany[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [companies, total] = await Promise.all([
      this.companyRepository.findAll(skip, limit, filter),
      this.companyRepository.count(filter)
    ]);

    return {
      companies,
      total
    };
  }
} 