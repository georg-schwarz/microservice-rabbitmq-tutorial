import * as AMQP from "amqplib";

const AMQP_URL = process.env.AMQP_URL;
const EXCHANGE = process.env.AMQP_EXCHANGE;
const MAX_RETRIES = 30;

const main = async () => {
  console.log("[SETUP] Starting Producer Microservice Instance...");
  console.log(`[SETUP] URL of AMQP Broker: ${AMQP_URL}`);

  try {
    const con = await connect(AMQP_URL);
    const channel = await con.createChannel();
    channel.assertExchange(EXCHANGE, "topic", { durable: false });
    const q = await channel.assertQueue("consumer_queue", { exclusive: false });
    channel.bindQueue(q.queue, EXCHANGE, "#");
    channel.consume(q.queue, handleMsg);
  } catch (e) {
    console.error("[FAIL] Unable to connect to AMQP broker! \n%s", e);
    process.exit(1);
  }

  console.log("[READY] Consumer is ready to retrieve messages.");
};

const handleMsg = async (msg: AMQP.ConsumeMessage) => {
  console.log(
    "[Consumer] %s:'%s'",
    msg.fields.routingKey,
    msg.content.toString()
  );

  await sleep(100); // simulate msg processing time
};

const connect = async (amqpUrl: string): Promise<AMQP.Connection> => {
  let retry = 0;
  while (retry < MAX_RETRIES) {
    try {
      console.log(
        `[SETUP] Try to connect to AMQP broker. [%i retries remaining]`,
        MAX_RETRIES - retry
      );

      const connection = await AMQP.connect(amqpUrl);
      console.log("[SUCCESS] Connected to AMQP Broker.");

      return Promise.resolve(connection);
    } catch (e) {
      retry++;
      await sleep(2000);
    }
  }

  return Promise.reject();
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

main();
