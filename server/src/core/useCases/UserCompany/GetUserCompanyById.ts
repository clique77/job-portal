import { IUserCompany } from "../../../data/models/UserCompany";
import { IUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { IGetUserCompanyByIdUseCase } from "./interfaces/IUserCompanyUseCase";

export class GetUserCompanyById implements IGetUserCompanyByIdUseCase {
  private userCompanyRepository: IUserCompanyRepository;

  constructor(userCompanyRepository: IUserCompanyRepository) {
    this.userCompanyRepository = userCompanyRepository;
  }

  async execute(userCompanyId: string): Promise<IUserCompany | null> {
    return this.userCompanyRepository.findById(userCompanyId);
  }
} 
