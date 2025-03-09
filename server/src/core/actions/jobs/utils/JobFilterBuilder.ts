import { JobFilter } from '../../../../data/repositories/jobs/JobRepository';

export class JobFilterBuilder {
  buildFilter(filter: JobFilter): any {
    const formattedFilter: any = { ...filter };

    if (filter.salary) {
      if (filter.salary.min) {
        formattedFilter['salary.min'] = { $gte: filter.salary.min };
      }
      if (filter.salary.max) {
        formattedFilter['salary.max'] = { $lte: filter.salary.max };
      }
      delete formattedFilter.salary;
    }

    if (filter.title) {
      formattedFilter.title = { $regex: filter.title, $options: 'i' };
    }

    if (filter.tags && filter.tags.length > 0) {
      formattedFilter.tags = { $in: filter.tags };
    }

    return formattedFilter;
  }
}
