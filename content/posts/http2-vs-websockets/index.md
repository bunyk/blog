---
title: "Http2 vs Websockets: a study of dashboard performance"
date: 2018-12-20T15:48:50+02:00
draft: true
---

In this post we will compare the performance of different approaches to load data for analytics dashboards, or any page where we have lots of different requests to the same server.

<!--more-->

## Baseline

We will start from sample dashboard created with Vue.js and Chart.js (which does not matter) and loaded over HTTP/1.1 (which does matter). It should look like this, and appearance of it would not change till the end of this article, but we will try to change how quick it appears in the browser window:

{{< figure src="dashboard.png" title="Our sample dashboard" width="600px">}}

Static content will be served by Nginx server, which would also be a proxy to our backend python server which would serve data. It will expose 8080 port for HTTP, and 8083 for HTTPS:

{{< highlight yml >}}
{{< include src="docker-compose.yml">}}
{{< /highlight >}}

Nginx container just runs image with copies configuration files, and our HTML inside:

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

This is the HTML of dashboard:

{{< highlight html >}}
{{< include src="dashboard.html">}}
{{< /highlight >}}

It renders `CHARTS_COUNT` charts. We will work here with the function `loadData()`, to see what we could improve. But first - test our baseline. Run `docker-compose up` and check how quick it loads.

{{< figure src="network_debug.png" title="Screenshot of network tab of browser debugger" width="600px">}}

29 seconds for 50 graphs? When all the JavaScript was loaded from cache? Not cool. Not cool at all. But why it takes so much? Lets open request details:

{{< figure src="request_timings.png" title="Time of separate request" width="600px">}}

We see that 24 seconds are spent in **Blocked** state, and 4.5 in **Waiting**, everything else is negligible. Here what [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor/request_details#Timings) has to say about that states:
