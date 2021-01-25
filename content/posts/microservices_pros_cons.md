---
title: "To split or not to split? What are microservices and should you use them."
date: 2021-01-08T20:53:45+01:00
tags:
- notes
---

Notes from reading early 2nd edition release of book **Building Microservices** by *Sam Newman*.

<!--more-->

## Microservices

**Microservices** are independently releasable services modelled around business domain. **Services** are programs that encapsulate some functionality and make it available to other services over network.

There is related concept of Service Oriented Architecture (SOA). Microservices is one of the approaches to SOA in the same way as Scrum is one of the Agile approaches to development. In SOA you have multiple services that collaborate with each other, but they are not necessary independently deployable. For microservices independent deployment is a must.

Independent deployment means that you could deploy your microservices without having to deploy any other service. This could be achieved by designing service boundaries properly.

To have proper boundaries, you should model your services around business domain, so the changes that involve different services become less likely.

Popular 3-layer architecture of front-end (UI), back-end (business logic) and storage (Database), is contrast to this, because most of the time adding some new feature involves changing each layer. For example to display new field, it needs to be added to UI, to back-end for processing, and to database schema. But this architecture is so popular because of Conway's law: "Any organization that designs a system will produce a design whose structure is a copy of the organization's communication structure", and the fact that organisations often had developers grouped into departments by their qualification - database administration, UI design, etc... Instead it's better to build around business departments - warehouse, sales, accounting, etc...

From the outside of the service boundary microservice should look like a black box. It should hide as much information as possible and share as little as possible. Information could be shared by API endpoints or messages in message queues. Each microservice should own their own state. Sharing single database between different microservices is a big no no. This is intended to make changing internal implementation very easy, and is similar to concept of encapsulation in OOP.

What size should microservices be? Well, small, so they could be easily understood, but there is no exact measure. Size should depend on purpose and architecture and is not very important concern.

Microservices require some supporting tech:

* Log aggregation
* Distributed tracing
* Containers and orchestration
* Streaming (event queues)
* Cloud infrastructure

## Monoliths

**Monolith** is opposite concept - anything that is not independently deployed. Monolith could be implemented in many ways: it could be developed as single application, it could be built from multiple independently developed modules or it could be **distributed monolith**: bunch of services that does not share code, and could be located on different hosts but still have to be de deployed together. 

Contrary to popular opinion that monolith is a bad thing and often associated with legacy, it is not legacy. Actually, it should be default choice, and you should have reasons to not use monolith. 

Monoliths have lots of serious advantages, like simplicity, avoiding problems of distributed systems, better code reuse inside monolith (if you need function, you just call it, no need for copy-paste or creating external library). 


## How to choose? 

### Advantages of microservices
You should use microservices if you want to allow developers independently work on their parts of the software, so they don't get in each ones way. One developer could want to do a deployment to fix a bug, but other could want to wait with deployment, because there is unfixed bug in master branch that needs to be fixed first. If you have company with hundreds of employees, you should definitely consider them.

* They allow **heterogenity**. You will not be constrained by one language or framework.
* **Robustness**. Failure of one microservices should cause less harm than failure of whole monolith and not bring system down. 
* **Precise scallability**. You scale only what needs to be scaled. If you see that you need more performance, you could start more instances of the service that is bottleneck, and not deploy whole app couple of times.
* **Faster deployment**. Deploying one-line change in million-code app will take more time and resources than in small microservice.

### Pain points
You should better not use microservices for new products and in startups where domain is not yet precisely defined and could quickly change. If your team consists only from 5 people, you definitely don't need them.

* **More overhead work** to develop and support microservices.
* Problems with **data consistency**
* **Techology overload**
* **Hard to develop**. You will no longer be able to run whole system on your local machine. 
* **Hard to do reporting** and queries across data in different services.
* **Hard to troubleshoot and monitor**. To find failure in a system you will need to look into multiple services.
* **Hard to test**. It is hard to create fixtures and environment to run system test. Often false positives would be caused by configuration of test environment.
* **Increased latency**. What before would have been call to a function or reading a RAM, now would be a network request, which significantly slows things down.
