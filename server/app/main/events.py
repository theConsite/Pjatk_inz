import json
from flask import session, request, render_template
from flask_socketio import emit, join_room, leave_room
from .. import socketio
from . import main

clients = {}

roomsMetadata = {}

@main.route('/validate-chat', methods=['POST'])
def check():
    response = {'message': 'Dołączanie do pokoju...', 'status': 200}
    data =request.json
    if(data['room'] in [None, ''] or data['user'] in [None, '']):
        return json.dumps({'result':'Pusta nazwa użytkownika lub pokoju'}), 500, {'ContentType':'application/json'}
    if(data['room'] in roomsMetadata):
        roomData = roomsMetadata[data['room']]
        if(data['user'] in roomData['users'] or data['password'] != roomData['password']):
            response['message'] = 'Wystąpił błąd dołączania do pokoju, sprawdź dane i spróbuj ponownie'
            response['status'] = 500
    else:
        response['message'] = 'Tworzenie pokoju...'
    return json.dumps({'result':response['message']}), response['status'], {'ContentType':'application/json'}

@main.route('/register-user', methods=['POST'])
def register():
    response = {'message': 'Sukces', 'status': 200}
    data =request.json
    if(data['room'] in [None, ''] or data['user'] in [None, '']):
        return json.dumps({'result':'Pusta nazwa użytkownika lub pokoju'}), 500, {'ContentType':'application/json'}
    if(data['room'] in roomsMetadata):
        roomData = roomsMetadata[data['room']]
        if(data['user'] in roomData['users'] or data['password'] != roomData['password']):
            response['message'] = 'Wystąpił błąd dołączania do pokoju, sprawdź dane i spróbuj ponownie'
            response['status'] = 500
        else:
            roomData['users'].append(data['user'])
            session['name'] = data['user']
            session['room'] = data['room']
    else:
        roomsMetadata[data['room']] = {'users': [data['user']], 'password': data['password']}
        response['message'] = 'Utworzono pokój'
        session['name'] = data['user']
        session['room'] = data['room']
    return json.dumps({'result':response['message']}), response['status'], {'ContentType':'application/json'}


@socketio.on('joined', namespace='/chat')
def joined(message):
    room = session.get('room')
    join_room(room)
    try:
        clients[room].append(request.sid)
    except:
        clients[room] = [request.sid]
    emit('status', {'msg': session.get('name') + ' dołączył do czatu.'}, room=room)


@socketio.on('text', namespace='/chat')
def text(message):
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
    room = session.get('room')
    uname = session.get('name')
    roomsMetadata[room]['users'].remove(uname)
    leave_room(room)
    clients[room].remove(request.sid)
    print(clients)
    emit('status', {'msg': uname + ' wyszedł z czatu.'}, room=room)

