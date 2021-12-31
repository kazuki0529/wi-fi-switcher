import { Request } from '../domain/model/Request';
import RequestRepository from '../repository/RequestRepository';

export interface IRequestUseCase {
  getAll: () => Promise<Array<Request>>;
  create: (data: Omit<Request, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Request>;
  update: (id: string, data: Partial<Omit<Request, 'id'>>) => Promise<Request>;
}

export default function RequestUseCase(): IRequestUseCase {
  const repo = RequestRepository();
  return {
    getAll: async () => {
      return repo.getAll();
    },
    create: async (data) => {
      return repo.create(data);
    },
    update: async (id, data) => {
      return repo.update(id, data);
    },
  };
};