import { IUserCompany } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IGetUserCompaniesUseCase } from "./interfaces/IUserCompanyUseCase";

export class GetUserCompanies implements IGetUserCompaniesUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userId: string): Promise<IUserCompany[]> {
    return this.userCompanyRepository.findByUser(userId);
  }
} 