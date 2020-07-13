import * as AMQP from 'amqplib'

const AMQP_URL = process.env.AMQP_URL
const exchange = "all"
const key = "domainA.execution.*"


const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

const connect = async (amqpUrl: string): Promise<AMQP.Connection>  => {
    let retry = 0
    while(retry < 10) {
        try {
            console.log("Attempting to connect to AMQP Broker.")
            const connection = await AMQP.connect(amqpUrl)
            console.log("Connected to AMQP Broker.")
            return Promise.resolve(connection)
        } catch (e) {
            retry ++
            await sleep(2000)
        }
    }
    console.log("Could not connect to AMQP Broker!")
    return Promise.reject()
}


console.log("Starting Producer Microservice Instance...")
console.log(`URL of AMQP Broker: ${AMQP_URL}`)
connect(AMQP_URL).then(async (connection: AMQP.Connection) => {
    const channel = await connection.createChannel()
    channel.assertExchange(exchange, 'topic', {
        durable: false
      });

    // TODO: consume and log events
})