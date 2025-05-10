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
    return UserCompany.find({ userId })
      .populate('companyId', 'name logoUrl description')
      .sort({ createdAt: -1 });
  }

  async findByCompany(companyId: string): Promise<IUserCompany[]> {
    return UserCompany.find({ companyId })
      .populate('userId', 'name email role')
      .sort({ role: 1, createdAt: -1 });
  }

  async findByUserAndCompany(userId: string, companyId: string): Promise<IUserCompany | null> {
    return UserCompany.findOne({ userId, companyId });
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