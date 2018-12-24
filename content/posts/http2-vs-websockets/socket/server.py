import asyncio
import random

from sanic import Sanic
from sanic.response import json

app = Sanic() # It is almost like Flask, just asyncronous

@app.route('/data/<data:int>')
async def return_data(request, data):
    return json(get_data(
        data, int(request.args.get('size', 10))
    ))

async def get_data(data, size):
    # First we wait 1-5 seconds to simulate request to database
    await asyncio.sleep(1 + random.random() * 4)

    # then start random walk from point that equals to data given
    # This is done to be able to distinguish between different graphs
    position = data
    data = []
    for i in range(size):
        position += random.random() - 0.5
        data.append(position)
    # And return the data of that random walk
    return data


@app.websocket('/ws')
async def websocket(request, websocket):
    while True:
        data = await websocket.recv()
        asyncio.create_task(handle_socket_data(websocket, data))

async def handle_socket_data(websocket, data, router):
    try:
        json_data = json.loads(data)
    except json.decoder.JSONDecodeError:
        await websocket.send('Malformed json', data)
        return
    if not isinstance(json_data, dict):
        await websocket.send('Request should be object', json_data)
        return
    if 'id' not in json_data:
        await websocket.send('no id in request', json_data)
        return
    if 'data' not in json_data:
        await websocket.send('no data in request', json_data)
        return
    data = json_data['data']
    size = json_data.get('size', 10)

    await websocket.send(json.dumps(dict(
        id=json_data['id'],
        data=get_data(data, size)
    )))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
