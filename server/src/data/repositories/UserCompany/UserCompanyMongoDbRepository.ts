import UserCompany from "../../models/UserCompany";
import { IUserCompanyRepository, UserCompanyCreateData, UserCompanyUpdateData, UserCompanyFilter } from "./UserCompanyRepository";
import { IUserCompany, CompanyRole } from "../../models/UserCompany";

export class UserCompanyMongoDBRepository implements IUserCompanyRepository {
  async create(userCompanyData: UserCompanyCreateData): Promise<IUserCompany> {
    const userCompany = new UserCompany(userCompanyData);
    return userCompany.save();
  }

  async findById(id: string): Promise<IUserCompany | null> {
    return UserCompany.findById(id)
      .populate('userId', 'name email')
      .populate('companyId', 'name logoUrl');
  }

  async update(id: string, userCompanyData: UserCompanyUpdateData): Promise<IUserCompany | null> {
    return UserCompany.findByIdAndUpdate(id, userCompanyData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserCompany.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(skip: number, limit: number, filter?: UserCompanyFilter): Promise<IUserCompany[]> {
    const query = this.buildQuery(filter);
    return UserCompany.find(query)
      .populate('userId', 'name email')
      .populate('companyId', 'name logoUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<IUserCompany[]> {
    const userCompanies = await UserCompany.find({ userId })
      .populate('companyId', 'name logoUrl description')
      .sort({ createdAt: -1 });
    
    const Company = require('../../models/Company').default;
    const companiesCreatedByUser = await Company.find({ createdBy: userId });
    
    const existingCompanyIds = userCompanies.map(uc => {
      const companyId = uc.companyId as any;
      return companyId?._id?.toString() || companyId?.toString();
    });
    
    for (const company of companiesCreatedByUser) {
      if (existingCompanyIds.includes(company._id.toString())) {
        continue;
      }
      
      const userCompanyData = {
        userId,
        companyId: company._id,
        role: CompanyRole.OWNER,
        status: 'ACTIVE'
      };
      
      const newUserCompany = new UserCompany(userCompanyData);
      await newUserCompany.save();
      
      const populatedCompany = await UserCompany.findById(newUserCompany._id)
        .populate('companyId', 'name logoUrl description');
        
      if (populatedCompany) {
        userCompanies.push(populatedCompany);
      }
    }
    
    return userCompanies;
  }

  async findByCompany(companyId: string): Promise<IUserCompany[]> {
    return UserCompany.find({ companyId })
      .populate('userId', 'name email role')
      .sort({ role: 1, createdAt: -1 });
  }

  async findByUserAndCompany(userId: string, companyId: string): Promise<IUserCompany | null> {
    const userCompany = await UserCompany.findOne({ userId, companyId });
    
    if (userCompany) {
      console.log(`UserCompanyRepo: Found existing relationship between user ${userId} and company ${companyId}`);
      return userCompany;
    }
    
    console.log(`UserCompanyRepo: No relationship found, checking if user ${userId} is creator of company ${companyId}`);
    const Company = require('../../models/Company').default;
    const company = await Company.findById(companyId);
    
    if (!company) {
      console.log(`UserCompanyRepo: Company ${companyId} not found`);
      return null;
    }
    
    const creatorId = company.createdBy ? company.createdBy.toString() : '';
    const userIdStr = userId.toString();
    
    if (creatorId === userIdStr) {
      console.log(`UserCompanyRepo: User ${userId} is creator of company ${companyId}, creating relationship`);
      
      const newUserCompany = new UserCompany({
        userId,
        companyId,
        role: CompanyRole.OWNER,
        status: 'ACTIVE'
      });
      
      try {
        await newUserCompany.save();
        console.log(`UserCompanyRepo: Created UserCompany relationship with ID ${newUserCompany._id}`);
        return newUserCompany;
      } catch (error) {
        console.error(`UserCompanyRepo: Error creating relationship:`, error);
        return null;
      }
    }
    
    console.log(`UserCompanyRepo: User ${userId} is not creator of company ${companyId}`);
    return null;
  }

  async checkUserRole(userId: string, companyId: string, roles: CompanyRole[]): Promise<boolean> {
    const userCompany = await UserCompany.findOne({ userId, companyId });
    if (!userCompany) return false;
    return roles.includes(userCompany.role);
  }

  async count(filter?: UserCompanyFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return UserCompany.countDocuments(query);
  }

  private buildQuery(filter?: UserCompanyFilter): any {
    const query: any = {};

    if (!filter) return {};

    if (filter.userId) {
      query.userId = filter.userId;
    }

    if (filter.companyId) {
      query.companyId = filter.companyId;
    }

    if (filter.role) {
      query.role = filter.role;
    }

    return query;
  }
}

export default UserCompanyMongoDBRepository;