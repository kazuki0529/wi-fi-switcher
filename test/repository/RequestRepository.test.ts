import * as dynamodblib from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Status } from '../../src/domain/model/Request';
import target from '../../src/repository/RequestRepository';

const dynamoMock = mockClient(dynamodblib.DynamoDBDocumentClient);

describe('Repository for requests', () => {
  beforeEach(() => {
    process.env.TABLE_NAME = 'TABLE_NAME';
    dynamoMock.reset();
  });

  describe('getAll function', () => {

    it('should get its data from DynamoDB', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      dynamoMock
        .on(dynamodblib.QueryCommand)
        .callsFake(mock);

      // When
      await target().getAll();

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith({
        TableName: process.env.TABLE_NAME,
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
    });

    it('should return a list of registered requests', async () => {
      //Setup
      const data = [
        {
          id: uuidv4(),
          status: 'Rejected',
          start: moment().toISOString(),
          end: moment().toISOString(),
          createdAt: moment().toISOString(),
          updatedAt: moment().toISOString(),
        },
        {
          id: uuidv4(),
          status: 'Approve',
          start: moment().toISOString(),
          end: moment().toISOString(),
          createdAt: moment().toISOString(),
          updatedAt: moment().toISOString(),
        },
      ];
      const mock = jest.fn().mockResolvedValue({ Items: data });
      dynamoMock
        .on(dynamodblib.QueryCommand)
        .callsFake(mock);

      // When
      const result = await target().getAll();

      // Then
      expect(result).toEqual(data.map(e => ({
        ...e,
        start: moment(e.start),
        end: moment(e.end),
        createdAt: moment(e.createdAt),
        updatedAt: moment(e.updatedAt),
      })));
    });

  });


  describe('create function', () => {

    it('should register data to DynamoDB', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      dynamoMock
        .on(dynamodblib.PutCommand)
        .callsFake(mock);

      const data = {
        start: moment(),
        end: moment(),
      };

      // When
      await target().create(data);

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(expect.objectContaining({
        TableName: process.env.TABLE_NAME,
        Item: {
          ...data,
          _p_key: expect.any(String),
          _s_key: expect.any(String),
          _gsi1_p_key: 'REQUEST#STATUS',
          _gsi1_s_key: '1',
          id: expect.any(String),
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          status: 'Request',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      }));
    });

    it('should return the registered data', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      dynamoMock
        .on(dynamodblib.PutCommand)
        .callsFake(mock);

      // When
      const data = {
        start: moment(),
        end: moment(),
      };
      const result = await target().create(data);

      // Then
      expect(result).toEqual(expect.objectContaining({
        ...data,
        id: expect.any(String),
        status: 'Request',
        createdAt: expect.any(moment),
        updatedAt: expect.any(moment),
      }));
    });

  });

  describe('update function', () => {

    it('should update data to DynamoDB', async () => {
      //Setup
      const mock = jest.fn().mockResolvedValue({});
      dynamoMock
        .on(dynamodblib.UpdateCommand)
        .callsFake(mock);

      const id = uuidv4();
      const data = {
        status: 'Approve' as Status,
        start: moment(),
        end: moment(),
      };

      // When
      await target().update(id, data);

      // Then
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(expect.objectContaining({
        TableName: process.env.TABLE_NAME,
        Key: {
          _p_key: id,
          _s_key: id,
        },
        UpdateExpression: 'SET #status = :status, #start = :start, #end = :end, #_gsi1_p_key = :_gsi1_p_key, #_gsi1_s_key = :_gsi1_s_key, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#_gsi1_p_key': '_gsi1_p_key',
          '#_gsi1_s_key': '_gsi1_s_key',
          '#end': 'end',
          '#start': 'start',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':_gsi1_p_key': 'REQUEST#STATUS',
          ':_gsi1_s_key': '2',
          ':start': data.start.toISOString(),
          ':end': data.end.toISOString(),
          ':status': data.status,
          ':updatedAt': expect.any(String),
        },
        ReturnValues: 'ALL_NEW',
      }));
    });

    it('should return the updated data', async () => {
      //Setup
      const data = {
        Attributes: {
          _p_key: uuidv4(),
          _s_key: uuidv4(),
          _gsi1_p_key: 'REQUEST#STATUS',
          _gsi1_s_key: '1',
          id: uuidv4(),
          status: 'Approve',
          start: moment().toISOString(),
          end: moment().toISOString(),
          createdAt: moment().toISOString(),
          updatedAt: moment().toISOString(),
        },
      };
      const mock = jest.fn().mockResolvedValue(data);
      dynamoMock
        .on(dynamodblib.UpdateCommand)
        .callsFake(mock);

      // When
      const id = uuidv4();
      const result = await target().update(id, { status: 'Approve' as Status });

      // Then
      expect(result).toEqual({
        id: data.Attributes.id,
        status: data.Attributes.status,
        start: moment(data.Attributes.start),
        end: moment(data.Attributes.end),
        createdAt: moment(data.Attributes.createdAt),
        updatedAt: moment(data.Attributes.updatedAt),
      });
    });

  });

});
