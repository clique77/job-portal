import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository } from "../../../data/repositories/Company/CompanyRepository";
import { ISearchCompaniesUseCase } from "./interfaces/ICompanyUseCase";

export class SearchCompanies implements ISearchCompaniesUseCase {
  private companyRepository: ICompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute(query: string, page: number = 1, limit: number = 10): Promise<ICompany[]> {
    const skip = (page - 1) * limit;
    return this.companyRepository.search(query, skip, limit);
  }
} 