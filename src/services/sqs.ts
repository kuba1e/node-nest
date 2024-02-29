import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from '@nestjs/common';

const client = new SQSClient({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const queueUrl = process.env.AWS_SQS_QUEUE_URL;

export const sendMessageToQueue = async (body) => {
  try {
    const command = new SendMessageCommand({
      MessageBody: body,
      QueueUrl: queueUrl,
      MessageAttributes: {
        OrderId: { DataType: 'String', StringValue: '4421x' },
      },
    });

    const result = await client.send(command);

    return result;
  } catch (error) {
    Logger.error(`Error from sqs: ${error}`);
  }
};
