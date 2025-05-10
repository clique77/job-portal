import { IUserCompany } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IGetUserCompanyRelationUseCase } from "./interfaces/IUserCompanyUseCase";

export class GetUserCompanyRelation implements IGetUserCompanyRelationUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userId: string, companyId: string): Promise<IUserCompany | null> {
    return this.userCompanyRepository.findByUserAndCompany(userId, companyId);
  }
} 