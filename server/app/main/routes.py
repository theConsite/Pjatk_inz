import json
from flask import session, render_template, request
from . import main

@main.route('/', methods=['GET'])
def index():
    return render_template('index.html')  


@main.route('/chat')
def chat():
    return render_template('index.html')


@main.route('/register-user', methods=['POST'])
def register():
    req_data = request.json
    session['name'] = req_data['name']
    session['room'] = req_data['room']
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}