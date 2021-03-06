---
title: "HTTP2 vs WebSockets: a study of dashboard performance"
date: 2018-12-20T15:48:50+02:00
---

In this post, we will compare the performance of different approaches to load data for analytics dashboards, or any page where we have lots of different requests to the same server.

<!--more-->

## Baseline

We will start from sample dashboard created with Vue.js and Chart.js (which does not matter) and loaded over HTTP/1.1 (which does matter). It should look like this, and appearance of it would not change till the end of this article, but we will try to change how quickly it appears in the browser window:

![Example dashboard](/content/dashboard.png "Our sample dashboard")

Static content will be served by Nginx server, which would also be a proxy to our backend python server which would serve data. It will expose 8080 port for HTTP and 8083 for HTTPS:

(If you are bored with lot's of code - scroll down, there will be explanations of what happens, I just publish it here to make this experiment reproducible)

```yml
version: '3'
services:
    server:
        image: server
        build:
            context: .
            dockerfile: nginx.docker
        ports:
            - 8080:80
            - 8083:443
    backend:
        image: backend
        build:
            context: .
            dockerfile: backend.docker
```

Nginx container just runs image with a copy of configuration file and our HTML inside:

```docker
FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY dashboard.html /var/www/index.html
```

And this is its configuration file. It tells to listen at port 80, serve files from `/var/www`, and redirect requests to all URLs that have prefix `/api/` to our backend container:

```
user nginx;

events {
  worker_connections 1024;
}

http {
    sendfile on;
    
    include /etc/nginx/mime.types;

    server {
        listen 80;

        root /var/www;

        location /api/ {
            proxy_pass      http://backend:8080/;
        }
    }
}
```

Here is Dockerfile for backend server:

```docker
FROM python:3.7

ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code

RUN pip install sanic
COPY server.py /code/server.py

EXPOSE 8080

CMD python /code/server.py
```

It has Python3.7 inside, installs Sanic framework, exposes port 8080 and runs `server.py`, which will provide us with data:

```python
import asyncio
import random

from sanic import Sanic
from sanic.response import json as json_response

app = Sanic() # It is almost like Flask, just asyncronous

@app.route('/data/<data:int>')
async def return_data(request, data):
    return json_response(await get_data(
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

```

And the biggest listing in this post - HTML (well, mostly JavaScript) of the dashboard:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <style>
        .chart {
            width: 350px; height: 200px;
            margin: 3px; border: 1px solid black;
            position: relative; float: left;
        }
    </style>
</head>

<body>
    <div id="app">
        <p>Loaded charts: {{loaded_chart_count}}</p>
        <div v-for="chart in charts" class="chart">
            <chart :widget="chart" v-once></chart>
        </div>
    </div>
  
<script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.21/vue.min.js'></script>

<script >
console.time('load'); // Measure time from here to end of load
const DATA_LEN = 50;
const CHARTS_COUNT = 50;

var data = {
    charts: _.range(CHARTS_COUNT),
    loaded_chart_count: 0,
};


Vue.component('chart', {
  template: '<canvas width="350" height="200"></canvas>',
  props: ['widget'],
  mounted: function() {
    createChart(this.$el, this.widget);
  }
});

var createChart = function(el, widget) {
    // Load data and render line chart in given element
    loadData(widget, function(chart_data) {
      new Chart(el, {
          type: 'line',
          data: {
              labels: _.range(chart_data.length),
              datasets: [{
                  label: 'Data ' + widget,
                  data: chart_data,
              }]
          },
      });
      data.loaded_chart_count ++;
      if(data.loaded_chart_count == CHARTS_COUNT) {
        console.timeEnd('load'); // stop load timer
      }
    });
};

new Vue({
  el: "#app",
  data: data
});

function loadData(widget, cb) {
    // Load data for widget given, and when it is loaded - call cb
    fetch('/api/data/' + widget + '?size=' + DATA_LEN).then(res => res.json()).then(cb);
}
</script>
</body>
</html>
```

It loads Charts.js and Vue using CDN and renders `CHARTS_COUNT` charts. We will work here with the function `loadData()`, to see what we could improve. But first - test our baseline. Run `docker-compose up` and check how quickly it loads. We could do it in browser console using `console.time`, and on network tab:

![](/content/network_debug.png "Screenshot of network tab of browser debugger")

29 seconds for 50 graphs? When all the JavaScript was loaded from cache? Not cool. Not cool at all.

## Debugging the problem

But why it takes so much? Lets open request details:

![](/content/request_timings.png "Time of separate request")

We see that 24 seconds are spent in **Blocked** state, and 4.5 in **Waiting**, everything else is negligible. Here what [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor/request_details#Timings) has to say about that states:

> * **Blocked:** Time spent in a queue waiting for a network connection.
> 
>     The browser imposes a limit on the number of simultaneous connections that can be made to a single server. In Firefox this defaults to 6, but can be changed using the network.http.max-persistent-connections-per-server preference. If all connections are in use, the browser can't download more resources until a connection is released.
> 
> * **Waiting:** Waiting for a response from the server.

Let's assume that we optimized everything we could about time of request processing on the server because my post is not about this. What could we do about time spent blocked? Could we increase the limit of simultaneous connections in a browser? [RFC 2616](https://tools.ietf.org/html/rfc2616#section-8.1.4) (document that defines HTTP/1.1) does not recommend this, and Firefox already has that amount higher than recommended:

>   Clients that use persistent connections SHOULD limit the number of
>   simultaneous connections that they maintain to a given server. A
>   single-user client SHOULD NOT maintain more than 2 connections with
>   any server or proxy. A proxy SHOULD use up to 2 * N connections to
>   another server or proxy, where N is the number of simultaneously
>   active users. These guidelines are intended to improve HTTP response
>   times and avoid congestion.


There are other solutions, like [domain sharding](https://medium.com/@jperasmus11/domain-sharding-on-the-modern-web-dc97df4f6a90) where we duplicate our resources on different domains, so this limit is not applicable, but it requires configuring other domains on Nginx, updating front-end to do requests to different domains, and additional DNS calls. 

Another option is to do one request per dashboard and receive all the data that dashboard needs in one response. The most important downside of this - decrease in [perceived performance](https://en.wikipedia.org/wiki/Perceived_performance), when user will not be able to see top graphs which are requested first, first, but will observe inactivity on the page for a long time and then everything will load. And this will not be possible when a user creates dashboard dynamically by adding widgets here and there. And will require a rewrite of server and client.

But there is a possibility to do all request over one connection and then receive all responses over the same one:


## WebSockets

First, for Nginx to pass WebSocket requests to the backend server, we need to change location configuration for our API like this:

```nginx
        location /api/ {
            proxy_pass      http://backend:8080/; # this line was here before, the rest are added
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
        }
```

Then, as we will send all the requests and receive all the responses over one connection, and they will be received not in the same order as they were sent, we need to figure out how to match requests with responses. That could be done using unique ids, which define to which chart each response belongs.

So, we will replace our `loadData` function that called `fetch` with the following code:

```javascript
var ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/api/ws/');

ws.onopen = function() {
    // Vue instance should be created after socket is open because otherwise 
    // components could try to send requests before it opens, and will fail
    new Vue({
      el: "#app",
      data: data
    });
}

var socketSubscribers = {}; // will map request id's to repsponse handlers
ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    var subscriber = socketSubscribers[data.id];
    if(subscriber) {
        subscriber(data);
        // TODO: maybe remove subscriber
    };
};

function get_unique_id() {
    // Will not work for multiple users, for production use some UUID implementation
    get_unique_id.uid = (get_unique_id.uid || 0) + 1;
    return get_unique_id.uid
}

function loadData(widget, cb) {
    // Load data for widget given, and when it is loaded - call cb
    var id = get_unique_id();

    // Send request 
    ws.send(JSON.stringify({
        id: id, 
        data: widget,
        size: DATA_LEN,
    }));
    // Add subscriber for response with this id
    socketSubscribers[id] = function (data) {
        cb(data.data);
    };
}
```

This code is artificially simplified to fit in this post, and for example, proper ID generation, handling of errors, reconnect in case of lost connection are not implemented.

Let's also look at how the server is changed. We need to add a new handler for WebSocket endpoint:

```python
@app.websocket('/ws')
async def websocket(request, websocket):
    while True: # Run forever
        data = await websocket.recv() # when receiving request from socket
        
        # start task to handle that, pass it socket
        asyncio.create_task(handle_socket_data(websocket, data)) 

async def handle_socket_data(websocket, data):
    try:
        json_data = json.loads(data)
        data = json_data['data']
        size = json_data.get('size', 10)
        await websocket.send(json.dumps(dict(
            id=json_data['id'],
            data=await get_data(data, size)
        )))
    except Exception as e:
        await websocket.send(json.dumps(dict(
            error=str(e)
        )))
        return
```

The server is not as complex as front-end part, but it is just because we are not re-implemented router here. Which we are likely to do if our goal was to multiplex multiple requests over one WebSocket.

So, unfortunately, Firefox does not have WebSocket debugger to see it's performance, but we used `console.time` to measure time from start of script execution to the moment when `CHARTS_COUNT` charts are finished loading, and it gives me 5215ms. This is a lot better than 29 seconds. 5-6 times better.

Could we do this even better? Well, time of each request is random and between 1 and 5 seconds, so if we will have it under 5 seconds it will be just an accident, but if better means not only faster but maintainable, then yes.

This code above is a very simple example. It becomes more complicated when you had different endpoints so you will need to reimplement router for WebSockets handler. Then if you have different HTTP methods, you will also need to add that into the router and into the WebSocket payload. Then, if you need auth, cache control, you will start to reimplement HTTP. And it has a lot of features. For example, the browser already has a cache for requests and is able to update it using different methods (Etag, If-Modified-Since). Frameworks already have routers, auth and stuff like that. 

Additionally, if you have microservice architecture, will you create WebSocket for each service? Or create a microservice proxy that connects to other microservices over HTTP and provides WebSocket interface? Or add it to the backlog and forget about it forever, because you will never get to it because you will have to support that huge pile of <del>sh</del> code you wrote to optimize page load time.

So, let me show you a better way:

## HTTP2

First and biggest task that we need to do in order to use HTTP2 is to have TLS certificate for our domain. If you are serious about your app, you should have them for https anyway. For our experiments we could generate a self-signed certificate for localhost using this command:

```bash
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

Then just add that certificate to Nginx container:

```docker
COPY localhost.crt /etc/ssl/certs/localhost.crt;
COPY localhost.key /etc/ssl/private/localhost.key;
```

And now, update `nginx.conf` server section with this:

```nginx
        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;

        ssl_certificate /etc/ssl/certs/localhost.crt;
        ssl_certificate_key /etc/ssl/private/localhost.key;
```

Now, when we open https://localhost:8083/ in a browser, and check network tab, we will see this:

![](/content/http2_network_debug.png "Requests with HTTP2")

5.3 seconds and all requests start at the same time. Same speed improvement as WebSockets, but this time we just changed Nginx config, and not touched front-end or back-end code at all. 

Additional benefits from using HTTP is that it is now a lot easier to debug (you could explore WebSocket frames using Chrome debugger), but you could not reproduce socket request using `curl`. Also, here we automatically get browser cache and compression of HTTP headers.

Of course, some old browsers could have no support HTTP2, but this should not worry us, because the protocol is negotiated automatically.

## Conclusion

If you really have reason and resources to use WebSockets - use WebSockets. If your only task was to optimize page load, and you wanted to decrease time requests spend in a blocked state - just turn on HTTP2, don't repeat my mistake of developing WebSocket solution just because you do not know about HTTP2. You do now.
