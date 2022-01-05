from datetime import datetime
from os import environ

import boto3
from boto3.dynamodb.conditions import Attr, Key

status2num = {
    'Request': '1',
    'Approve': '2',
    'Rejected': '3',
}


def main():
    table = boto3.resource('dynamodb').Table(environ['TABLE_NAME'])

    now = datetime.strftime(datetime.utcnow(), '%Y-%m-%dT%H:%M:%S.000Z')
    option = {
        'IndexName': 'GSI-1',
        'KeyConditionExpression': Key('_gsi1_p_key').eq('REQUEST#STATUS') & Key('_gsi1_s_key').eq(status2num['Approve']),
        'FilterExpression': Attr('start').lte(now) & Attr('end').gte(now),
    }
    res = table.query(**option)
    items = res['Items']
    while 'LastEvaluatedKey' in res:
        res = table.query(
            **option,
            ExclusiveStartKey=res['LastEvaluatedKey']
        )
        items.extend(res['Items'])

    header = 'start,end,status'
    data = '\n'.join(
        [f'{row["start"]},{row["end"]},{row["status"]}' for row in items]
    ) if len(items) > 0 else ''
    print(f'{header}\n' + f'{data}' + ('\n' if len(items) > 0 else ''))


if __name__ == '__main__':
    main()
