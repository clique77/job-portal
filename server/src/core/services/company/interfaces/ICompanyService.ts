import { ICompany } from "../../../../data/models/Company";
import { CompanyCreateData, CompanyUpdateData, CompanyFilter } from "../../../../data/repositories/Company/CompanyRepository";

export interface ICompanyService {
  createCompany(companyData: CompanyCreateData, creatorId: string): Promise<ICompany>;
  getCompanyById(companyId: string): Promise<ICompany | null>;
  updateCompany(companyId: string, companyData: CompanyUpdateData, userId: string): Promise<ICompany | null>;
  deleteCompany(companyId: string, userId: string): Promise<boolean>;
  getAllCompanies(page?: number, limit?: number, filter?: CompanyFilter): Promise<{
    companies: ICompany[];
    total: number;
  }>;
  getCompaniesByCreator(userId: string, page?: number, limit?: number): Promise<{
    companies: ICompany[];
    total: number;
  }>;
  searchCompanies(query: string, page?: number, limit?: number): Promise<ICompany[]>;
} 