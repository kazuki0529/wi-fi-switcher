import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import moment from 'moment';
import RequestUseCase from './usecase/RequestUseCase';

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log(event);

  const usecase = RequestUseCase();

  switch (event.routeKey) {
    case 'GET /v1/requests': {
      const data = await usecase.getAll();
      return {
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
      };
    }
    case 'POST /v1/requests': {
      const body = event.body ? JSON.parse(event.body) : undefined;
      if (!body) throw new Error('The Body section is empty.');

      const req = {
        ...body,
        start: body.start ? moment(body.start) : undefined,
        end: body.end ? moment(body.end) : undefined,
      };

      const data = await usecase.create(req);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
      };
    }
    case 'PUT /v1/requests/{requestId}': {
      const id = event.pathParameters ? event.pathParameters.requestId : undefined;
      if (!id) throw new Error('The id has not been specified.');

      const body = event.body ? JSON.parse(event.body) : undefined;
      if (!body) throw new Error('The Body section is empty.');

      const req = {
        ...body,
        start: body.start ? moment(body.start) : undefined,
        end: body.end ? moment(body.end) : undefined,
      };

      const data = await usecase.update(id, req);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
      };
    };
    default: {
      throw new Error('An undefined path has been called.');
    };
  }
}
