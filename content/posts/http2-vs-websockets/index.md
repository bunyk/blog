---
title: "Http2 vs Websockets: a study of dashboard performance"
date: 2018-12-20T15:48:50+02:00
draft: true
---

In this post we will compare the performance of different approaches to load data for analytics dashboards.

## Baseline

We will start from sample dashboard created with Vue.js and Chart.js (which does not matter) and loaded over HTTP/1.1 (which does matter). It will look like this:

{{< figure src="dashboard.png" title="Our sample dashboard" width="400px">}}

This is the HTML of dashboard:

{{< highlight html >}}
{{< include src="dashboard.html">}}
{{< /highlight >}}

