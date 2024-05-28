from flask import session, request
from flask_socketio import emit, join_room, leave_room
from .. import socketio

clients = {}

@socketio.on('joined', namespace='/chat')
def joined(message):
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    room = session.get('room')
    join_room(room)
    try:
        clients[room].append(request.sid)
    except:
        clients[room] = [request.sid]
    print(clients)
    emit('status', {'msg': session.get('name') + ' has entered the room.'}, room=room)


@socketio.on('text', namespace='/chat')
def text(message):
    """Sent by a client when the user entered a new message.
    The message is sent to all people in the room."""
    print(message)
    emit('message', {'name': session.get('name'),'msg': message}, room=session.get('room'))

@socketio.on('pubKeyEmit', namespace='/chat')
def keyShare(key):
    room = session.get('room')
    nextIndex = clients[room].index(request.sid)+1
    if nextIndex == len(clients[room]):
        nextIndex = 0 
    emit('key', {'name': session.get('name'), 'key': key['key'], 'i': key['i'], 'isLast': key['i'] >= len(clients[room])-2, 'isSingleRoom': len(clients[room]) == 1}, to=clients[room][nextIndex])


@socketio.on('left', namespace='/chat')
def left(message):
    """Sent by clients when they leave a room.
    A status message is broadcast to all people in the room."""
    room = session.get('room')
    leave_room(room)
    clients[room].remove(request.sid)
    print(clients)
    emit('status', {'msg': session.get('name') + ' has left the room.'}, room=room)

