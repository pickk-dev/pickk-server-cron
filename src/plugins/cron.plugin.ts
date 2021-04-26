import { FastifyInstance } from 'fastify';
import fp, { PluginMetadata } from 'fastify-plugin';
import schedule from 'node-schedule';
import axios from 'axios';
import { config } from 'dotenv';

import { jobData } from '../jobs';

config();

function plugin(
  fastify: FastifyInstance,
  opts: PluginMetadata,
  next: (err?: Error) => void
) {
  fastify.addHook('onReady', (done) => {
    jobData.forEach(({ name, rule, endPoint }) =>
      schedule.scheduleJob(name, rule, async () => {
        await axios.post(process.env.SERVER_URL + endPoint);
      })
    );
    done();
  });

  fastify.addHook('onClose', (fastify, done) => {
    Object.values(schedule.scheduledJobs).forEach((job) => job.cancel());
    done();
  });

  next();
}

export const fastifyCron = fp(plugin, {
  fastify: '3.x',
  name: 'fastify-cron',
});
