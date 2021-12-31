import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Request, Status } from '../../src/domain/model/Request';
import RequestRepository from '../../src/repository/RequestRepository';
import target from '../../src/usecase/RequestUseCase';
jest.mock('../../src/repository/RequestRepository');


describe('Use cases for requests', () => {
  describe('create function', () => {
    it('should call a function that creates a request to the Repository layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        create: mock,
      }));

      const data = {
        start: moment(),
        end: moment(),
      };

      // When
      await target().create(data);

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(data);
    });

    it('should return the request it created', async () => {
      //Setup
      const data:Request = {
        id: uuidv4(),
        status: 'Rejected',
        start: moment(),
        end: moment(),
        createdAt: moment(),
        updatedAt: moment(),
      };
      const mock = jest.fn().mockResolvedValue(data);
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        create: mock,
      }));

      // When
      const result = await target().create({
        start: moment(),
        end: moment(),
      });

      // Then
      expect(result).toEqual(data);
    });

  });

  describe('getAll function', () => {
    it('should call a function that retrieves the list of requests to the RequestRepository layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue([]);
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        getAll: mock,
      }));

      // When
      await target().getAll();

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('should return a list of retrieved requests', async () => {
      //Setup
      const data: Array<Request> = [
        {
          id: uuidv4(),
          status: 'Rejected',
          start: moment(),
          end: moment(),
          createdAt: moment(),
          updatedAt: moment(),
        },
        {
          id: uuidv4(),
          status: 'Approve',
          start: moment(),
          end: moment(),
          createdAt: moment(),
          updatedAt: moment(),
        },
      ];
      const mock = jest.fn().mockResolvedValue(data);
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        getAll: mock,
      }));

      // When
      const result = await target().getAll();

      // Then
      expect(result).toEqual(data);
    });

  });

  describe('update function', () => {
    it('should call a function that updates the request to the Repository layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        update: mock,
      }));

      const id = uuidv4();
      const data = {
        status: 'Approve' as Status,
      };

      // When
      await target().update(id, data);

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(id, data);
    });


    it('should return the request it updated', async () => {
      //Setup
      const data:Request = {
        id: uuidv4(),
        status: 'Rejected',
        start: moment(),
        end: moment(),
        createdAt: moment(),
        updatedAt: moment(),
      };
      const mock = jest.fn().mockResolvedValue(data);
      (<jest.Mock>RequestRepository).mockImplementation(() => ({
        update: mock,
      }));


      // When
      const result = await target().update(data.id, {
        status: 'Approve' as Status,
      });

      // Then
      expect(result).toEqual(data);
    });

  });

});