import { IUserCompany, CompanyRole } from '../../models/UserCompany';

export interface UserCompanyCreateData {
  userId: string;
  companyId: string;
  role: CompanyRole;
}

export interface UserCompanyUpdateData {
  role?: CompanyRole;
}

export interface UserCompanyFilter {
  userId?: string;
  companyId?: string;
  role?: CompanyRole;
}

export interface IUserCompanyRepository {
  create(userCompanyData: UserCompanyCreateData): Promise<IUserCompany>;
  findById(id: string): Promise<IUserCompany | null>;
  update(id: string, userCompanyData: UserCompanyUpdateData): Promise<IUserCompany | null>;
  delete(id: string): Promise<boolean>;
  findAll(skip: number, limit: number, filter?: UserCompanyFilter): Promise<IUserCompany[]>;
  findByUser(userId: string): Promise<IUserCompany[]>;
  findByCompany(companyId: string): Promise<IUserCompany[]>;
  findByUserAndCompany(userId: string, companyId: string): Promise<IUserCompany | null>;
  checkUserRole(userId: string, companyId: string, roles: CompanyRole[]): Promise<boolean>;
  count(filter?: UserCompanyFilter): Promise<number>;
}

export const getUserCompanyRepository = (): IUserCompanyRepository => {
  const { UserCompanyMongoDBRepository } = require('./UserCompanyMongoDbRepository');
  return new UserCompanyMongoDBRepository();
}