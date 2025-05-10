import { IUserCompany, CompanyRole } from "../../../../data/models/UserCompany";
import { UserCompanyCreateData, UserCompanyUpdateData } from "../../../../data/repositories/UserCompany/UserCompanyRepository";

export interface IAddUserToCompanyUseCase {
  execute(userCompanyData: UserCompanyCreateData): Promise<IUserCompany>;
}

export interface IGetUserCompanyByIdUseCase {
  execute(userCompanyId: string): Promise<IUserCompany | null>;
}

export interface IUpdateUserCompanyRoleUseCase {
  execute(userCompanyId: string, role: CompanyRole, requesterId: string): Promise<IUserCompany | null>;
}

export interface IRemoveUserFromCompanyUseCase {
  execute(userId: string, companyId: string, requesterId: string): Promise<boolean>;
}

export interface IGetUserCompaniesUseCase {
  execute(userId: string): Promise<IUserCompany[]>;
}

export interface IGetCompanyMembersUseCase {
  execute(companyId: string): Promise<IUserCompany[]>;
}

export interface ICheckUserCompanyRoleUseCase {
  execute(userId: string, companyId: string, allowedRoles: CompanyRole[]): Promise<boolean>;
}

export interface IGetUserCompanyRelationUseCase {
  execute(userId: string, companyId: string): Promise<IUserCompany | null>;
} 