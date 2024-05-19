from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio


@socketio.on('message')
def handle_message(data):
    recipient = data['recipient']
    message = data['message']
    emit('message', data, room=recipient)

@socketio.on('join')
def on_join(data):
    username = data['username']
    join_room(username)
    emit('status', {'msg': f'{username} has joined the room.'}, room=username)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    leave_room(username)
    emit('status', {'msg': f'{username} has left the room.'}, room=username)

