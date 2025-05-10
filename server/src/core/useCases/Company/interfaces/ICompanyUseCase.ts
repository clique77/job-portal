import { ICompany } from "../../../../data/models/Company";
import { CompanyCreateData, CompanyUpdateData, CompanyFilter } from "../../../../data/repositories/Company/CompanyRepository";

export interface ICreateCompanyUseCase {
  execute(companyData: CompanyCreateData, creatorId: string): Promise<ICompany>;
}

export interface IGetCompanyByIdUseCase {
  execute(companyId: string): Promise<ICompany | null>;
}

export interface IUpdateCompanyUseCase {
  execute(companyId: string, companyData: CompanyUpdateData, userId: string): Promise<ICompany | null>;
}

export interface IDeleteCompanyUseCase {
  execute(companyId: string, userId: string): Promise<boolean>;
}

export interface IGetAllCompaniesUseCase {
  execute(page: number, limit: number, filter?: CompanyFilter): Promise<{
    companies: ICompany[];
    total: number;
  }>;
}

export interface IGetCompaniesByCreatorUseCase {
  execute(userId: string, page: number, limit: number): Promise<{
    companies: ICompany[];
    total: number;
  }>;
}

export interface ISearchCompaniesUseCase {
  execute(query: string, page: number, limit: number): Promise<ICompany[]>;
} 