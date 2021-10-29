import csv
from os import write
from flask import Blueprint, request, abort, jsonify, Flask
app = Flask(__name__, static_folder='./static', static_url_path='')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/requests', methods=['GET'])
def get_requests():
    with open('../data/schedule.csv', 'r', newline='\n') as csv_file:
        reader = csv.DictReader(csv_file)
        return jsonify([row for row in reader])


@app.route('/api/requests', methods=['POST'])
def save_requests():
    json = request.get_json()

    with open('../data/schedule.csv', 'w', newline='') as csv_file:
        writer = csv.writer(csv_file, lineterminator='\n')
        writer.writerow(['start', 'end', 'status'])
        writer.writerows([list(item.values()) for item in json])
        return "", 200


app.run(host='0.0.0.0', port=5000, debug=True)
