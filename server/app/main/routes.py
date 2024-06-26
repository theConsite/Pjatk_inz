from flask import render_template
from . import main

@main.route('/', methods=['GET'])
def index():
    return render_template('index.html')  


@main.route('/chat', methods=['GET'])
def chat():
    return render_template('index.html')
