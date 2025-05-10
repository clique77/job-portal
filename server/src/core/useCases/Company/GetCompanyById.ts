import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository } from "../../../data/repositories/Company/CompanyRepository";
import { IGetCompanyByIdUseCase } from "./interfaces/ICompanyUseCase";

export class GetCompanyById implements IGetCompanyByIdUseCase {
  private companyRepository: ICompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute(companyId: string): Promise<ICompany | null> {
    return this.companyRepository.findById(companyId);
  }
} 