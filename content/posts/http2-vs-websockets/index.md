---
title: "HTTP2 vs WebSockets: a study of dashboard performance"
date: 2018-12-20T15:48:50+02:00
draft: true
---

In this post we will compare the performance of different approaches to load data for analytics dashboards, or any page where we have lots of different requests to the same server.

<!--more-->

## Baseline

We will start from sample dashboard created with Vue.js and Chart.js (which does not matter) and loaded over HTTP/1.1 (which does matter). It should look like this, and appearance of it would not change till the end of this article, but we will try to change how quick it appears in the browser window:

{{< figure src="dashboard.png" title="Our sample dashboard" width="600px">}}

Static content will be served by Nginx server, which would also be a proxy to our backend python server which would serve data. It will expose 8080 port for HTTP, and 8083 for HTTPS:

(If you are bored with lot's of code - scroll down, there will be explanations of what happens, I just publish it here to make this experiment reproducible)

{{< highlight yml >}}
{{< include src="docker-compose.yml">}}
{{< /highlight >}}

Nginx container just runs image with copies configuration file, and our HTML inside:

{{< highlight docker >}}
{{< include src="nginx.docker">}}
{{< /highlight >}}

And this is it's configuration file. It tells to listen at port 80, serve files from `/var/www`, and redirect requests to all URLs that have prefix `/api/` to our backend container:

{{< highlight nginx >}}
{{< include src="nginx.conf">}}
{{< /highlight >}}

Here is Dockerfile for backend server:

{{< highlight docker >}}
{{< include src="backend.docker">}}
{{< /highlight >}}

It has Python3.7 inside, installs Sanic framework, exposes port 8080 and runs `server.py`, which will provide us with data:

{{< highlight python >}}
{{< include src="server.py">}}
{{< /highlight >}}

And the biggest listing in this post - HTML (well, mostly JavaScript) of dashboard:

{{< highlight html >}}
{{< include src="dashboard.html">}}
{{< /highlight >}}

It loads Charts.js and Vue using CDN, and renders `CHARTS_COUNT` charts. We will work here with the function `loadData()`, to see what we could improve. But first - test our baseline. Run `docker-compose up` and check how quick it loads.

{{< figure src="network_debug.png" title="Screenshot of network tab of browser debugger" width="600px">}}

29 seconds for 50 graphs? When all the JavaScript was loaded from cache? Not cool. Not cool at all.

## Debugging the problem

But why it takes so much? Lets open request details:

{{< figure src="request_timings.png" title="Time of separate request" width="600px">}}

We see that 24 seconds are spent in **Blocked** state, and 4.5 in **Waiting**, everything else is negligible. Here what [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor/request_details#Timings) has to say about that states:

> * **Blocked:** Time spent in a queue waiting for a network connection.
> 
>     The browser imposes a limit on the number of simultaneous connections that can be made to a single server. In Firefox this defaults to 6, but can be changed using the network.http.max-persistent-connections-per-server preference. If all connections are in use, the browser can't download more resources until a connection is released.
> 
> * **Waiting:** Waiting for a response from the server.

Let's assume that we optimized everything we could about time of request processing on the server, because post it not about this. What could we do about time spent blocked? Could we increase the limit of simultaneous connections in browser? [RFC 2616](https://tools.ietf.org/html/rfc2616#section-8.1.4) (document that defines HTTP/1.1) does not recommend this, and Firefox already has that amount higher than recommented:

>   Clients that use persistent connections SHOULD limit the number of
>   simultaneous connections that they maintain to a given server. A
>   single-user client SHOULD NOT maintain more than 2 connections with
>   any server or proxy. A proxy SHOULD use up to 2 * N connections to
>   another server or proxy, where N is the number of simultaneously
>   active users. These guidelines are intended to improve HTTP response
>   times and avoid congestion.


There are another solutions, like [Domain sharding](https://medium.com/@jperasmus11/domain-sharding-on-the-modern-web-dc97df4f6a90) where we duplicate our resources on different domain, so this limit is not applicable, but it requires configuring different domain on Nginx, updating front-end to do requests to different domains, and additional DNS calls. 

Another option is to do one request per dashboard, and receive all the data that dashboard needs in one response. Most important downside of this - decrease in [perceived performance](https://en.wikipedia.org/wiki/Perceived_performance), when user will not be able to see top graphs which are requrested first first, but will observe inactivity on page for a long time and then everything will load. And this will not be possible when user creates dashboard dynamically by adding widgets here and there. And will require rewrite of server and client.

But there is possibility to do all request over one connection and then receive all responses over the same one:


## WebSockets

First, for Nginx to pass WebSocket requests to backend server, we need to change location configuration for our api like this:

{{< highlight nginx >}}
        location /api/ {
            proxy_pass      http://backend:8080/; # this line was here before, the rest are added
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
        }
{{< /highlight >}}


## HTTP2



{{< highlight nginx >}}
        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;

        ssl_certificate /etc/ssl/certs/localhost.crt;
        ssl_certificate_key /etc/ssl/private/localhost.key;
{{< /highlight >}}

{{< highlight docker >}}
COPY localhost.crt /etc/ssl/certs/localhost.crt;
COPY localhost.key /etc/ssl/private/localhost.key;
{{< /highlight >}}
