'use strict';

const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
  .split(',')
  .map(b => b.trim());

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'backend-boilerplate',
  brokers,
  requestTimeout: 60000,
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

const createConsumer = (groupId) => kafka.consumer({ groupId });

module.exports = { producer, createConsumer };
