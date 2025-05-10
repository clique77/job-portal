import { ICompany } from '../../models/Company';

export interface CompanyCreateData {
  name: string;
  description: string;
  logoUrl?: string;
  createdBy: string;
}

export interface CompanyUpdateData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface CompanyFilter {
  name?: string;
  createdBy?: string;
  search?: string;
}

export interface ICompanyRepository {
  create(companyData: CompanyCreateData): Promise<ICompany>;
  findById(id: string): Promise<ICompany | null>;
  update(id: string, companyData: CompanyUpdateData): Promise<ICompany | null>;
  delete(id: string): Promise<boolean>;
  findAll(skip: number, limit: number, filter?: CompanyFilter): Promise<ICompany[]>;
  findByCreator(userId: string, skip: number, limit: number): Promise<ICompany[]>;
  count(filter?: CompanyFilter): Promise<number>;
  search(query: string, skip: number, limit: number): Promise<ICompany[]>;
}

export const getCompanyRepository = (): ICompanyRepository => {
  const { CompanyMongoDBRepository } = require('./CompanyMongoDbRepository');
  return new CompanyMongoDBRepository();
}