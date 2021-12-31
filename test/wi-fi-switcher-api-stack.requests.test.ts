import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Request } from '../src/domain/model/Request';
import RequestUseCase from '../src/usecase/RequestUseCase';
import { handler } from '../src/wi-fi-switcher-api-stack.requests';
jest.mock('../src/usecase/RequestUseCase');

const eventBase: APIGatewayEvent = {
  resource: '',
  path: '',
  httpMethod: '',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: {},
  stageVariables: null,
  requestContext: {
    authorizer: null,
    protocol: '',
    requestTimeEpoch: 0,
    path: '',
    accountId: '',
    resourceId: '',
    stage: '',
    domainPrefix: '',
    requestId: '',
    identity: {
      principalOrgId: null,
      cognitoIdentityPoolId: null,
      cognitoIdentityId: null,
      apiKey: '',
      cognitoAuthenticationType: null,
      userArn: '',
      apiKeyId: '',
      userAgent: '',
      accountId: '',
      caller: '',
      sourceIp: '',
      accessKey: '',
      cognitoAuthenticationProvider: null,
      user: '',
      clientCert: {
        clientCertPem: '',
        issuerDN: '',
        serialNumber: '',
        subjectDN: '',
        validity: {
          notAfter: '',
          notBefore: '',
        },
      },
    },
    domainName: '',
    resourcePath: '',
    httpMethod: '',
    extendedRequestId: '',
    apiId: '',
  },
  body: null,
  isBase64Encoded: false,
};

describe('requests for Lambda functions', () => {
  describe('POST /requests', () => {
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
        httpMethod: 'POST',
        resource: '/v1/requests',
        path: '/v1/requests',
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
        httpMethod: 'POST',
        resource: '/v1/requests',
        path: '/v1/requests',
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

  describe('GET /requests', () => {
    it('should call a function that retrieves the list of requests to the UseCase layer', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue([]);
      (<jest.Mock>RequestUseCase).mockImplementation(() => ({
        getAll: mock,
      }));

      const event = {
        httpMethod: 'GET',
        resource: '/v1/requests',
        path: '/v1/requests',
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
        httpMethod: 'GET',
        resource: '/v1/requests',
        path: '/v1/requests',
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

  describe('PUT /requests/{requestId}', () => {
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
        httpMethod: 'PUT',
        resource: '/v1/requests/{requestId}',
        path: '/v1/requests/{requestId}',
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
        httpMethod: 'PUT',
        resource: '/v1/requests/{requestId}',
        path: '/v1/requests/{requestId}',
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