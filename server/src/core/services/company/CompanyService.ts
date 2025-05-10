import { ICompany } from "../../../data/models/Company";
import { getCompanyRepository, CompanyCreateData, CompanyUpdateData, CompanyFilter } from "../../../data/repositories/Company/CompanyRepository";
import { CreateCompany } from "../../useCases/Company/CreateCompany";
import { GetCompanyById } from "../../useCases/Company/GetCompanyById";
import { UpdateCompany } from "../../useCases/Company/UpdateCompany";
import { DeleteCompany } from "../../useCases/Company/DeleteCompany";
import { GetAllCompanies } from "../../useCases/Company/GetAllCompanies";
import { GetCompaniesByCreator } from "../../useCases/Company/GetCompaniesByCreator";
import { SearchCompanies } from "../../useCases/Company/SearchCompanies";
import { ICompanyService } from "./interfaces/ICompanyService";

export class CompanyService implements ICompanyService {
  private createCompanyUseCase: CreateCompany;
  private getCompanyByIdUseCase: GetCompanyById;
  private updateCompanyUseCase: UpdateCompany;
  private deleteCompanyUseCase: DeleteCompany;
  private getAllCompaniesUseCase: GetAllCompanies;
  private getCompaniesByCreatorUseCase: GetCompaniesByCreator;
  private searchCompaniesUseCase: SearchCompanies;

  constructor() {
    const companyRepository = getCompanyRepository();
    
    this.createCompanyUseCase = new CreateCompany(companyRepository);
    this.getCompanyByIdUseCase = new GetCompanyById(companyRepository);
    this.updateCompanyUseCase = new UpdateCompany(companyRepository);
    this.deleteCompanyUseCase = new DeleteCompany(companyRepository);
    this.getAllCompaniesUseCase = new GetAllCompanies(companyRepository);
    this.getCompaniesByCreatorUseCase = new GetCompaniesByCreator(companyRepository);
    this.searchCompaniesUseCase = new SearchCompanies(companyRepository);
  }

  async createCompany(companyData: CompanyCreateData, creatorId: string): Promise<ICompany> {
    return this.createCompanyUseCase.execute(companyData, creatorId);
  }

  async getCompanyById(companyId: string): Promise<ICompany | null> {
    return this.getCompanyByIdUseCase.execute(companyId);
  }

  async updateCompany(companyId: string, companyData: CompanyUpdateData, userId: string): Promise<ICompany | null> {
    return this.updateCompanyUseCase.execute(companyId, companyData, userId);
  }

  async deleteCompany(companyId: string, userId: string): Promise<boolean> {
    return this.deleteCompanyUseCase.execute(companyId, userId);
  }

  async getAllCompanies(page: number = 1, limit: number = 10, filter?: CompanyFilter): Promise<{
    companies: ICompany[];
    total: number;
  }> {
    return this.getAllCompaniesUseCase.execute(page, limit, filter);
  }

  async getCompaniesByCreator(userId: string, page: number = 1, limit: number = 10): Promise<{
    companies: ICompany[];
    total: number;
  }> {
    return this.getCompaniesByCreatorUseCase.execute(userId, page, limit);
  }

  async searchCompanies(query: string, page: number = 1, limit: number = 10): Promise<ICompany[]> {
    return this.searchCompaniesUseCase.execute(query, page, limit);
  }
}

export default new CompanyService(); 