import asyncio
import random

from sanic import Sanic
from sanic.response import json

app = Sanic()

@app.route('/data/<data:int>')
async def return_data(request, data):
    await asyncio.sleep(0.5 + random.random() * 2)
    position = data
    data = []
    for i in range(int(request.args.get('size', 10))):
        position += random.random() - 0.5
        data.append(position)
    return json(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
