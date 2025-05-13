import { ICompany } from "../../../data/models/Company";
import { ICompanyRepository, CompanyUpdateData } from "../../../data/repositories/Company/CompanyRepository";
import { IUpdateCompanyUseCase } from "./interfaces/ICompanyUseCase";
import { getUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { CompanyRole } from "../../../data/models/UserCompany";

export class UpdateCompany implements IUpdateCompanyUseCase {
  private companyRepository: ICompanyRepository;
  private userCompanyRepository;

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository;
    this.userCompanyRepository = getUserCompanyRepository();
  }

  async execute(companyId: string, companyData: CompanyUpdateData, userId: string): Promise<ICompany | null> {
    console.log(`UpdateCompany: User ${userId} attempting to update company ${companyId}`);
    
    try {
      const userCompany = await this.userCompanyRepository.findByUserAndCompany(userId, companyId);
      
      if (userCompany) {
        console.log(`UpdateCompany: Found UserCompany relationship with role: ${userCompany.role}`);
      } else {
        console.log(`UpdateCompany: No UserCompany relationship found`);
      }
      
      const hasUserCompanyPermission = userCompany && 
        [CompanyRole.OWNER, CompanyRole.ADMIN].includes(userCompany.role);

      if (hasUserCompanyPermission) {
        console.log(`UpdateCompany: User has permission via UserCompany relationship`);
      } else {
        const company = await this.companyRepository.findById(companyId);
        
        if (!company) {
          console.log(`UpdateCompany: Company ${companyId} not found`);
          throw new Error(`Company not found with ID: ${companyId}`);
        }
        
        const creatorId = company.createdBy ? company.createdBy.toString() : 'undefined';
        console.log('UpdateCompany: Creator check -', {
          companyId: companyId,
          creatorId: creatorId,
          userId: userId.toString(),
          isMatch: creatorId === userId.toString()
        });
        
        const creatorIdStr = company.createdBy ? company.createdBy.toString() : '';
        const userIdStr = userId.toString();
        
        if (!creatorIdStr || creatorIdStr !== userIdStr) {
          console.log(`UpdateCompany: User ${userId} is not the creator of company ${companyId}`);
          
          throw new Error('You do not have permission to update this company. Only company owners or administrators can update company details.');
        }
        
        console.log(`UpdateCompany: User is the creator of the company`);
      }
      
      console.log(`UpdateCompany: Proceeding with update for company ${companyId}`);
      const updatedCompany = await this.companyRepository.update(companyId, companyData);
      console.log(`UpdateCompany: Update complete for company ${companyId}`);
      return updatedCompany;
    } catch (error) {
      console.error('UpdateCompany: Error occurred:', error);
      throw error;
    }
  }
} 