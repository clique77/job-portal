import { ICompany } from "../../../data/models/Company";
import { CompanyCreateData, ICompanyRepository } from "../../../data/repositories/Company/CompanyRepository";
import { ICreateCompanyUseCase } from "./interfaces/ICompanyUseCase";

export class CreateCompany implements ICreateCompanyUseCase {
  private companyRepository: ICompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async execute(companyData: CompanyCreateData, creatorId: string): Promise<ICompany> {
    const data = {
      ...companyData,
      createdBy: creatorId
    };
    
    return this.companyRepository.create(data);
  }
} 