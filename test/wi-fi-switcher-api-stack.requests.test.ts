import { APIGatewayProxyEventV2 } from 'aws-lambda';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Request } from '../src/domain/model/Request';
import RequestUseCase from '../src/usecase/RequestUseCase';
import { handler } from '../src/wi-fi-switcher-api-stack.requests';
jest.mock('../src/usecase/RequestUseCase');

const eventBase: APIGatewayProxyEventV2 = {
  version: '1',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  requestContext: {
    accountId: '',
    apiId: '',
    domainName: '',
    domainPrefix: '',
    http: {
      method: '',
      path: '',
      protocol: '',
      sourceIp: '',
      userAgent: '',
    },
    requestId: '',
    routeKey: '',
    stage: '',
    time: '',
    timeEpoch: 0,
  },
  body: '',
  isBase64Encoded: false,
};

describe('requests for Lambda functions', () => {
  describe('POST /v1/requests', () => {
    it('should call a function that creates a request to the UseCase layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        create: mock,
      }));

      const data = {
        status: 'Approve',
      };

      const event = {
        routeKey: 'POST /v1/requests',
        body: JSON.stringify(data),
      };

      // When
      await handler({ ...eventBase, ...event });

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
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        create: mock,
      }));


      const event = {
        routeKey: 'POST /v1/requests',
        body: JSON.stringify({
          status: 'Approve',
        }),
      };

      // When
      const result = await handler({ ...eventBase, ...event });

      // Then
      expect(result).toEqual({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          createdAt: data.createdAt?.toISOString(),
          updatedAt: data.updatedAt?.toISOString(),
        }),
      });
    });

  });

  describe('GET /v1/requests', () => {
    it('should call a function that retrieves the list of requests to the UseCase layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue([]);
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        getAll: mock,
      }));

      const event = {
        routeKey: 'GET /v1/requests',
      };

      // When
      await handler({ ...eventBase, ...event });

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
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        getAll: mock,
      }));

      const event = {
        routeKey: 'GET /v1/requests',
      };

      // When
      const result = await handler({ ...eventBase, ...event });

      // Then
      expect(result).toEqual({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data.map(e => ({
          ...e,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          createdAt: e.createdAt?.toISOString(),
          updatedAt: e.updatedAt?.toISOString(),
        }))),
      });
    });

  });

  describe('PUT /v1/requests/{requestId}', () => {
    it('should call a function that updates the request to the UseCase layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        update: mock,
      }));

      const data = {
        status: 'Approve',
      };

      const event = {
        routeKey: 'PUT /v1/requests/{requestId}',
        pathParameters: {
          requestId: uuidv4(),
        },
        body: JSON.stringify(data),
      };

      // When
      await handler({ ...eventBase, ...event });

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(event.pathParameters.requestId, data);
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
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        update: mock,
      }));


      const event = {
        routeKey: 'PUT /v1/requests/{requestId}',
        pathParameters: {
          requestId: uuidv4(),
        },
        body: JSON.stringify({
          status: 'Approve',
        }),
      };

      // When
      const result = await handler({ ...eventBase, ...event });

      // Then
      expect(result).toEqual({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          createdAt: data.createdAt?.toISOString(),
          updatedAt: data.updatedAt?.toISOString(),
        }),
      });
    });

  });

});