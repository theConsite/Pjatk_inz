import json
from flask import session, render_template, request
from . import main

@main.route('/', methods=['GET'])
def index():
    return render_template('index.html')  


@main.route('/chat')
def chat():
    return render_template('index.html')
