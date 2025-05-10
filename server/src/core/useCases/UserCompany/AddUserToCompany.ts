import { IUserCompany } from "../../../data/models/UserCompany";
import { IUserCompanyRepository, UserCompanyCreateData } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IAddUserToCompanyUseCase } from "./interfaces/IUserCompanyUseCase";

export class AddUserToCompany implements IAddUserToCompanyUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userCompanyData: UserCompanyCreateData): Promise<IUserCompany> {
    // Check if the relationship already exists
    const existingRelation = await this.userCompanyRepository.findByUserAndCompany(
      userCompanyData.userId,
      userCompanyData.companyId
    );

    if (existingRelation) {
      throw new Error('User is already associated with this company');
    }

    return this.userCompanyRepository.create(userCompanyData);
  }
} 