import json
from flask import session, render_template, request
from . import main
import os


keys_store_path = os.path.join(os.path.dirname(__file__), 'instance', 'keys_store.json')

# Ensure keys store exists
if not os.path.exists(keys_store_path):
    with open(keys_store_path, 'w') as f:
        json.dump({}, f)

@main.route('/', methods=['GET'])
def index():
    return render_template('index.html')  


@main.route('/chat')
def chat():
    return render_template('index.html')

@main.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    identity_key = data['identityKey']
    registration_id = data['registrationId']
    pre_key = data['preKey']
    signed_pre_key = data['signedPreKey']
    signed_pre_key_signature = data['signedPreKeySignature']

    with open(keys_store_path, 'r') as f:
        keys_store = json.load(f)

    keys_store[username] = {
        'identityKey': identity_key,
        'registrationId': registration_id,
        'preKey': pre_key,
        'signedPreKey': signed_pre_key,
        'signedPreKeySignature': signed_pre_key_signature
    }

    with open(keys_store_path, 'w') as f:
        json.dump(keys_store, f)

    return jsonify({'status': 'success'}), 201

@main.route('/get-pre-key/<username>', methods=['GET'])
def get_pre_key(username):
    with open(keys_store_path, 'r') as f:
        keys_store = json.load(f)

    if username in keys_store:
        return jsonify(keys_store[username]), 200
    else:
        return jsonify({'error': 'User not found'}), 404