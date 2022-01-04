import * as dynamodb from '@aws-sdk/client-dynamodb';
import * as dynamodblib from '@aws-sdk/lib-dynamodb';
import * as xray from 'aws-xray-sdk';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Request, Status } from '../domain/model/Request';

export interface IRequestRepository {
  getAll: () => Promise<Array<Request>>;
  create: (data: Omit<Request, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Request>;
  update: (id: string, data: Partial<Omit<Request, 'id'>>) => Promise<Request>;
}

const STATUS_TO_NUM = {
  Request: '1',
  Approve: '2',
  Rejected: '3',
};


export default function RequestRepository(): IRequestRepository {
  const {
    REGION,
    TABLE_NAME,
  } = process.env;
  const client = xray.captureAWSv3Client(
    dynamodblib.DynamoDBDocumentClient.from(
      new dynamodb.DynamoDBClient({
        region: REGION,
      }),
    ),
  );

  return {
    getAll: async () => {
      const data : Array<Request> = [];

      const query = async (params: dynamodblib.QueryCommandInput) => {
        console.log(params);
        const result = await client.send(new dynamodblib.QueryCommand(params));
        console.log(result);

        if (result.Items) {
          result.Items.forEach((e) => {
            data.push({
              ...e,
              start: moment(e.start),
              end: moment(e.end),
              createdAt: moment(e.createdAt),
              updatedAt: moment(e.updatedAt),
            } as Request);
          });
        }

        if (result.LastEvaluatedKey) {
          await client.send(new dynamodblib.QueryCommand({
            ...params,
            ...{
              ExclusiveStartKey: result.LastEvaluatedKey,
            },
          }));
        }
      };

      await query({
        TableName: TABLE_NAME,
        IndexName: 'GSI-1',
        KeyConditionExpression: '#key = :key ',
        ProjectionExpression: ['#id', '#start', '#end', '#status', '#createdAt', '#updatedAt'].join(','),
        ExpressionAttributeNames: {
          '#key': '_gsi1_p_key',
          '#id': 'id',
          '#start': 'start',
          '#end': 'end',
          '#status': 'status',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':key': 'REQUEST#STATUS',
        },
      });

      return data;
    },
    create: async (data) => {
      const id = uuidv4();
      const now = moment();
      const status : Status = 'Request';
      const item = {
        ...data,
        _p_key: id,
        _s_key: id,
        _gsi1_p_key: 'REQUEST#STATUS',
        _gsi1_s_key: STATUS_TO_NUM.Request,
        id: id,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
        status: status,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const params = {
        TableName: TABLE_NAME,
        Item: item,
      };
      console.log(params);
      const result = await client.send(new dynamodblib.PutCommand(params));
      console.log(result);

      return {
        ...data,
        id: item.id,
        status: status,
        createdAt: now,
        updatedAt: now,
      };
    },
    update: async (id, data) => {
      const now = moment();
      const gsi1 = data.status ? {
        _gsi1_p_key: 'REQUEST#STATUS',
        _gsi1_s_key: STATUS_TO_NUM[data.status as keyof typeof STATUS_TO_NUM],
      } : {};
      const item = {
        ...data,
        ...gsi1,
        start: data.start ? data.start.toISOString() : undefined,
        end: data.end ? data.end.toISOString(): undefined,
      };
      const updateKeys = Object.keys(item).filter(
        (key) =>
          item[key as keyof Partial<Omit<Request, 'id'>>] && !['id', 'createdAt', 'updatedAt'].includes(key),
      );
      const params: dynamodblib.UpdateCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          _p_key: id,
          _s_key: id,
        },
        UpdateExpression: `SET ${updateKeys
          .map((e) => `#${e} = :${e}`)
          .concat(['#updatedAt = :updatedAt'])
          .reduce((prev, curr) => `${prev}, ${curr}`)}`,
        ExpressionAttributeNames: updateKeys
          .map((e) => ({
            [`#${e}`]: e,
          }))
          .concat([
            {
              ['#updatedAt']: 'updatedAt',
            },
          ])
          .reduce((previousValue, currentValue) =>
            Object.assign(previousValue, currentValue),
          ),
        ExpressionAttributeValues:
          updateKeys
            .map((e) => {
              return {
                [`:${e}`]: item[e as keyof typeof item],
              };
            })
            .concat([
              {
                ':updatedAt': now.toISOString(),
              },
            ])
            .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
        ReturnValues: 'ALL_NEW',
      };

      console.log(params);
      const result = await client.send(new dynamodblib.UpdateCommand(params));
      console.log(result);

      return {
        id: result.Attributes?.id,
        start: moment(result.Attributes?.start),
        end: moment(result.Attributes?.end),
        status: result.Attributes?.status,
        createdAt: moment(result.Attributes?.createdAt),
        updatedAt: moment(result.Attributes?.updatedAt),
      };
    },
  };
};