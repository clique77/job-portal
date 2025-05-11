import { IUserCompany, CompanyRole } from "../../../../data/models/UserCompany";
import { UserCompanyCreateData } from "../../../../data/repositories/UserCompany/UserCompanyRepository";

export interface IUserCompanyService {
  addUserToCompany(userCompanyData: UserCompanyCreateData): Promise<IUserCompany>;
  getUserCompanyById(userCompanyId: string): Promise<IUserCompany | null>;
  updateUserCompanyRole(userCompanyId: string, role: CompanyRole, requesterId: string): Promise<IUserCompany | null>;
  removeUserFromCompany(userId: string, companyId: string, requesterId: string): Promise<boolean>;
  getUserCompanies(userId: string): Promise<IUserCompany[]>;
  getCompanyMembers(companyId: string): Promise<IUserCompany[]>;
  checkUserCompanyRole(userId: string, companyId: string, allowedRoles: CompanyRole[]): Promise<boolean>;
  getUserCompanyRelation(userId: string, companyId: string): Promise<IUserCompany | null>;
}