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