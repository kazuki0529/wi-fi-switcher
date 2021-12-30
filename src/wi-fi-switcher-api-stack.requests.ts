import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import moment from 'moment';
import RequestUseCase from './usecase/RequestUseCase';

export async function handler(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  const usecase = RequestUseCase();

  const pathPart = event.resource.substring('/v1'.length);

  switch (pathPart) {
    case '/requests': {
      if (event.httpMethod === 'POST') {
        const body = event.body ? JSON.parse(event.body) : undefined;
        if (!body) throw new Error('The Body section is empty.');

        const req = {
          ...body,
          start: moment(body.start),
          end: moment(body.end),
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
      if (event.httpMethod === 'GET') {
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

      throw new Error('An undefined method has been called.');
    };
    case '/requests/{requestId}': {
      if (event.httpMethod !== 'PUT') throw new Error('An undefined method has been called.');

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
