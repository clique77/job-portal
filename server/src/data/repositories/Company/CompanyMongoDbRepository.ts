import Company from "../../models/Company";
import { ICompanyRepository, CompanyCreateData, CompanyUpdateData, CompanyFilter } from "./CompanyRepository";
import { ICompany } from "../../models/Company";

export class CompanyMongoDBRepository implements ICompanyRepository {
  async create(companyData: CompanyCreateData): Promise<ICompany> {
    const company = new Company(companyData);
    return company.save();
  }

  async findById(id: string): Promise<ICompany | null> {
    return Company.findById(id);
  }

  async update(id: string, companyData: CompanyUpdateData): Promise<ICompany | null> {
    return Company.findByIdAndUpdate(id, companyData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Company.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(skip: number, limit: number, filter?: CompanyFilter): Promise<ICompany[]> {
    const query = this.buildQuery(filter);
    return Company.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
  }

  async findByCreator(userId: string, skip: number, limit: number): Promise<ICompany[]> {
    return Company.find({ createdBy: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async count(filter?: CompanyFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return Company.countDocuments(query);
  }

  async search(query: string, skip: number, limit: number): Promise<ICompany[]> {
    return Company.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' }}
    )
    .sort({ score: { $meta: 'textScore' }})
    .skip(skip)
    .limit(limit);
  }

  private buildQuery(filter?: CompanyFilter): any {
    const query: any = {};

    if (!filter) return {};

    if (filter.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.createdBy) {
      query.createdBy = filter.createdBy;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } }
      ];
    }

    return query;
  }
}

export default CompanyMongoDBRepository;