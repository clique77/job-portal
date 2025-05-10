import { IUserCompany, CompanyRole } from "../../../data/models/UserCompany";
import { getUserCompanyRepository, UserCompanyCreateData } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { AddUserToCompany } from "../../useCases/UserCompany/AddUserToCompany";
import { GetUserCompanyById } from "../../useCases/UserCompany/GetUserCompanyById";
import { UpdateUserCompanyRole } from "../../useCases/UserCompany/UpdateUserCompanyRole";
import { RemoveUserFromCompany } from "../../useCases/UserCompany/RemoveUserFromCompany";
import { GetUserCompanies } from "../../useCases/UserCompany/GetUserCompanies";
import { GetCompanyMembers } from "../../useCases/UserCompany/GetCompanyMembers";
import { CheckUserCompanyRole } from "../../useCases/UserCompany/CheckUserCompanyRole";
import { GetUserCompanyRelation } from "../../useCases/UserCompany/GetUserCompanyRelation";
import { IUserCompanyService } from "./interfaces/IUserCompanyService";

export class UserCompanyService implements IUserCompanyService {
  private addUserToCompanyUseCase: AddUserToCompany;
  private getUserCompanyByIdUseCase: GetUserCompanyById;
  private updateUserCompanyRoleUseCase: UpdateUserCompanyRole;
  private removeUserFromCompanyUseCase: RemoveUserFromCompany;
  private getUserCompaniesUseCase: GetUserCompanies;
  private getCompanyMembersUseCase: GetCompanyMembers;
  private checkUserCompanyRoleUseCase: CheckUserCompanyRole;
  private getUserCompanyRelationUseCase: GetUserCompanyRelation;

  constructor() {
    const userCompanyRepository = getUserCompanyRepository();
    
    this.addUserToCompanyUseCase = new AddUserToCompany(userCompanyRepository);
    this.getUserCompanyByIdUseCase = new GetUserCompanyById(userCompanyRepository);
    this.updateUserCompanyRoleUseCase = new UpdateUserCompanyRole(userCompanyRepository);
    this.removeUserFromCompanyUseCase = new RemoveUserFromCompany(userCompanyRepository);
    this.getUserCompaniesUseCase = new GetUserCompanies(userCompanyRepository);
    this.getCompanyMembersUseCase = new GetCompanyMembers(userCompanyRepository);
    this.checkUserCompanyRoleUseCase = new CheckUserCompanyRole(userCompanyRepository);
    this.getUserCompanyRelationUseCase = new GetUserCompanyRelation(userCompanyRepository);
  }

  async addUserToCompany(userCompanyData: UserCompanyCreateData): Promise<IUserCompany> {
    return this.addUserToCompanyUseCase.execute(userCompanyData);
  }

  async getUserCompanyById(userCompanyId: string): Promise<IUserCompany | null> {
    return this.getUserCompanyByIdUseCase.execute(userCompanyId);
  }

  async updateUserCompanyRole(userCompanyId: string, role: CompanyRole, requesterId: string): Promise<IUserCompany | null> {
    return this.updateUserCompanyRoleUseCase.execute(userCompanyId, role, requesterId);
  }

  async removeUserFromCompany(userId: string, companyId: string, requesterId: string): Promise<boolean> {
    return this.removeUserFromCompanyUseCase.execute(userId, companyId, requesterId);
  }

  async getUserCompanies(userId: string): Promise<IUserCompany[]> {
    return this.getUserCompaniesUseCase.execute(userId);
  }

  async getCompanyMembers(companyId: string): Promise<IUserCompany[]> {
    return this.getCompanyMembersUseCase.execute(companyId);
  }

  async checkUserCompanyRole(userId: string, companyId: string, allowedRoles: CompanyRole[]): Promise<boolean> {
    return this.checkUserCompanyRoleUseCase.execute(userId, companyId, allowedRoles);
  }

  async getUserCompanyRelation(userId: string, companyId: string): Promise<IUserCompany | null> {
    return this.getUserCompanyRelationUseCase.execute(userId, companyId);
  }
}

export default new UserCompanyService(); 