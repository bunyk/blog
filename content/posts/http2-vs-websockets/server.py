import asyncio
import random

from sanic import Sanic
from sanic.response import json

app = Sanic() # It is almost like Flask, just asyncronous

@app.route('/data/<data:int>')
async def return_data(request, data):
    # First we wait 1-5 seconds to simulate request to database
    await asyncio.sleep(1 + random.random() * 4)

    # then start random walk from point that equals to data given
    # This is done to be able to distinguish between different graphs
    position = data
    data = []
    for i in range(int(request.args.get('size', 10))):
        position += random.random() - 0.5
        data.append(position)
    # And return the data of that random walk
    return json(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
