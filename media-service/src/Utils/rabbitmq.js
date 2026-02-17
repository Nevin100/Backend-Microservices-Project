import amqp from 'amqplib';
import logger from "./logger.js";

// Singleton connection and channel
let connection = null;
let channel = null;

// RabbitMQ exchange name
const EXCHANGE_NAME = 'facebook_events';

// Function to connect to RabbitMQ and create a channel
export async function connectRabbitMQ() {
    try {
        // If already connected, return the existing channel
        if (channel) {
            return channel;
        }
        // Create a new connection and channel
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Assert the exchange (create if it doesn't exist)
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        logger.info('Connected to RabbitMQ');
        return channel;

    } catch (error) {
        logger.error('Failed to connect to RabbitMQ', { error });
        throw error;
    }
}

// Function to publish an event to RabbitMQ
export async function publishEvent(routingKey, message){
    try {
        // Ensure we have a channel before publishing
        if(!channel) {
            await connectRabbitMQ();
        }
        // Publish the message to the exchange with the specified routing key
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        logger.info(`Published event to RabbitMQ with routing key: ${routingKey}`, { message });
    } catch (error) {
        logger.error('Failed to publish event to RabbitMQ', { error });
        throw error;
    }
}

// Function to consume events from RabbitMQ
export async function consumeEvents(routingKey, callback) {
    try {
        if(!channel){
            await connectRabbitMQ();
        }
        // Assert a temporary queue and bind it to the exchange with the specified routing key
        const q = await channel.assertQueue('', { exclusive: true });

        // Bind the queue to the exchange with the routing key
        await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

        // Start consuming messages from the queue
        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                // Parse the message content and pass it to the callback function
                const messageContent = JSON.parse(msg.content.toString());
                logger.info(`Received event from RabbitMQ with routing key: ${routingKey}`, { message: messageContent });
                // Acknowledge the message after processing
                callback(messageContent);
                channel.ack(msg);
            }
        });
    }catch (error) {
        logger.error('Failed to consume events from RabbitMQ', { error });
        throw error;
    }
}
