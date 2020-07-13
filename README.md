# Event-Driven Microservice Communication Design using AMQP

This is a small proof of concept on how you can model event-driven choreography with AMQP for a microservice-based architecture.

**Context:**
Microservices strive for decoupling. However, they require standardization and automation in order to be a valid approach in the real world. The communication between microservices is one topic of this standardization. We propose to design an API style guide that every service team agrees to. The following thoughts can be a basis on the event-driven part of a API style guide. However, this is no generalizable solution but should be adapted to the project context. In a further step these style guides can and should be enforced by automated tests or linting (this step is not covered in this little tutorial).

**Roles:**
* Publishing Microservice *Producer* responsible for *domainA* .
* Consuming Microservice B *Consumer* responsible for *domainB* and interested in domain events of *domainA*.

## Domain Event Types
* Domain model changed events, e.g. `domainA_created`, `domainA_updated`, and `domainA_deleted`
* Domain action events, e.g. `domainA_action_executed` and `domainA_action_failed`

## Required AMQP Concepts
* *Producer*: publishing events, either directly to queues or to exchange.
* *Consumer*: consuming events from queues.
* *Exchange*: post-out box, various types for different publishing rules to queues, e.g. *fan-out*, *direct*, *topic*.
* *Queue*: FIFO-queue for consumers.

## Microservices and AMQP

### Before we start...

**Context:**
* Microservices are meant to decouple by using AMQP.
* Microservices want to subscribe only to events they are interested in.

**Producer Responsibilities:**
* The producer should only be responsible to publish events, making the event type somehow explicit.
* Should not know which consumers exist.

**Consumer Responsibilities:**
* The consumer should only be responsible to consume events and being able to subscribe to events of interest.
* Consumers want to run in multiple replicas and consume events only once. They build a *consumer group*.
* Should not know which producers exist.

### Microservice Design

**Exchanges:**
* There is one public topic-type exchange responsible for publishing all events under a certain topic.
* Each producer publishes its events over the global exchange under a good topic (see further down).
* As alternative, we could also use one exchange per domain / bounded context. But until we run into performance issues, we should keep it simple and use a global exchange. Naming it according to a microservice is a **bad** idea because this would introduce coupling by the need to know about the existance of another microservice. Keep it on domain-level instead.

**Queues:**
* One microservice type should have a queue per domain of interest that guarantees FIFO for all instances of its type. This also ensures all instances of a microservices representing a consumer group.
* The queue should use the topic mechanism to filter events of no interest.
* The queue connects to the global exchange (or to the matching domain exchange if multiple exist).
* The queue is microservice-specific and, thus, can include the name of the microservice in its name. 

**Event Topics:**
* Topics should be designed hierarchically. We propose somwthing like the following pattern `{domain}.{domainDetail}.{eventType}`. The concrete pattern should be project specific and be agreed on by every microservice team.
* An example for a domain model changed event would be `billing.user_information.created`, or `billing.user_information.deleted`.
* An example for a domain action event would be `billing.payment.executed` or `billing.payment.failed`.

### Event Detail Design

Events can hold information as *payload* or as *attributes* (which is equal to headers). The following questions arise and should be answered project-specifically:
* Do we want to send the whole model/data or just a reference on where to fetch it? (fat vs. thin events)
* What information do we need except the model/data?
  * e.g. a correlationId for tracking event flows
  * e.g. a timestamp for debuggin (be aware that timestamps are not a good mechanism to construct the order of events)
  * e.g. a model/data version. This introduces complexity but enables the evolution of the event API.
* Where do we want to put the additional information? (header/attributes vs. payload)

For our little example we came up with the following event detail design:
```
headers:
  - correlationId: number
  - timestamp: date-time
  - payloadVersion: semantic-version
payload:
  - the model/data that should be sent
```



