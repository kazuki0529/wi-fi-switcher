import uuid
from datetime import datetime
from os import environ

import boto3
from boto3.dynamodb.conditions import Key, Attr
from flask import Flask, jsonify, request, make_response

table = boto3.resource('dynamodb').Table(environ['TABLE_NAME'])
status2num = {
    'Request': '1',
    'Approve': '2',
    'Rejected': '3',
}

app = Flask(__name__, static_folder='./static', static_url_path='')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/approve/code', methods=['GET'])
def get_approve_code():
    print(f'APPROVE_CODE = {environ["APPROVE_CODE"]}')
    return environ['APPROVE_CODE'], 200


@app.route('/api/v1/requests', methods=['GET'])
def get_request_list():
    option = {
        'IndexName': 'GSI-1',
        'KeyConditionExpression': Key('_gsi1_p_key').eq('REQUEST#STATUS')
    }
    res = table.query(**option)
    items = res['Items']
    while 'LastEvaluatedKey' in res:
        res = table.query(
            **option,
            ExclusiveStartKey=res['LastEvaluatedKey']
        )
        items.extend(res['Items'])

    return jsonify([{k: v for k, v in row.items() if not k.startswith('_')} for row in items])


@app.route('/api/v1/requests', methods=['POST'])
def post_request():
    json = request.get_json()
    now = datetime.strftime(datetime.utcnow(), '%Y-%m-%dT%H:%M:%S.000Z')
    id = str(uuid.uuid4())

    item = dict({
        '_p_key': id,
        '_s_key': id,
        '_gsi1_p_key': 'REQUEST#STATUS',
        '_gsi1_s_key': status2num[json['status']],
        'id': id,
        'createdAt': now,
        'updatedAt': now
    }, **json)
    print(item)
    table.put_item(
        Item=item
    )

    return jsonify({k: v for k, v in item.items() if not k.startswith('_')})


@app.route('/api/v1/requests/<id>', methods=['PUT'])
def update_request(id: str):
    json = request.get_json()
    now = datetime.strftime(datetime.utcnow(), '%Y-%m-%dT%H:%M:%S.000Z')
    item = dict({
        '_gsi1_p_key': 'REQUEST#STATUS',
        '_gsi1_s_key': status2num[json['status']],
        'updatedAt': now
    }, **json)

    update_keys = [{'key': key, 'expName': i} for i, key in enumerate(item)]
    update_exp = 'set ' + ','.join([f'#{row["expName"]}=:{row["expName"]}' for row in update_keys])

    option = {
        'Key': {
            '_p_key': id,
            '_s_key': id
        },
        'UpdateExpression': update_exp,
        'ExpressionAttributeNames': {
            f'#{row["expName"]}': row['key'] for row in update_keys
        },
        'ExpressionAttributeValues': {
            f':{row["expName"]}': item[row['key']] for row in update_keys
        },
        "ReturnValues": 'ALL_NEW',
    }
    new_item = table.update_item(**option)

    print(new_item['Attributes'])
    return jsonify({k: v for k, v in new_item['Attributes'].items() if not k.startswith('_')})


@app.route('/api/v1/requests/approve/now', methods=['GET'])
def get_approve_list():
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

    response = make_response('\n'.join([f'{row["start"]},{row["end"]},{row["status"]}' for row in items]) + '\n')
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = 'attachment; filename=approve-now.csv'
    return response, 200


app.run(host='0.0.0.0', port=5000, debug=True)
