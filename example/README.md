# Microservice Example with RabbitMQ


## Build
`docker-compose build --parallel`

## Run
Unscaled demo: 
* `docker-compose up`

Replicated services demo: 
* `docker stack deploy --compose-file docker-compose.yml demostack` to start
* `docker stack services demostack` to see all services
* `docker service logs -f demostack_producer` to see logs of producer services
* `docker service logs -f demostack_consumer` to see logs of consumer services
* `docker stack rm demostack` to stop stack