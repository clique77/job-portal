import { IUserCompany } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IGetCompanyMembersUseCase } from "./interfaces/IUserCompanyUseCase";

export class GetCompanyMembers implements IGetCompanyMembersUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(companyId: string): Promise<IUserCompany[]> {
    return this.userCompanyRepository.findByCompany(companyId);
  }
} 