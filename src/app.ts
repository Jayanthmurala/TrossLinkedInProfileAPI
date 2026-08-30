import crypto from 'node:crypto';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { AppError } from './lib/errors.js';
import { fetchProfileByVanity } from './lib/linkedin.js';
import { extractVanityName, resolveProfileBody } from './schemas/profile.js';
import { LANDING_PAGE_HTML } from './lib/landing.js';

export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'test'
        ? false
        : {
            level: env.LOG_LEVEL,
            ...(env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {})
          },
    genReqId: () => crypto.randomUUID()
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.allowedOrigins.length ? env.allowedOrigins : true,
    credentials: true
  });
  await app.register(rateLimit, {
    global: true,
    max: 60,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: { code: 'rate_limited', message: 'Too many requests. Please try again shortly.' }
    })
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LinkedIn Profile API',
        version: '1.0.0',
        description:
          'Accepts a public LinkedIn profile URL and returns structured profile JSON via LinkedIn Voyager APIs (authenticated session).'
      },
      tags: [
        { name: 'Operations', description: 'Health and readiness' },
        { name: 'Profiles', description: 'LinkedIn profile resolution' }
      ]
    }
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.setErrorHandler((error, request, reply) => {
    const appError =
      error instanceof AppError
        ? error
        : error instanceof ZodError
          ? new AppError(422, 'validation_error', error.issues.map((i) => i.message).join(' '))
          : new AppError(500, 'internal_error', 'An unexpected error occurred.');
    if (appError.statusCode >= 500) request.log.error({ err: error }, 'Request failed');
    return reply.status(appError.statusCode).send({
      error: { code: appError.code, message: appError.message, requestId: request.id }
    });
  });

  app.get(
    '/',
    {
      config: { rateLimit: false },
      schema: {
        hide: true
      }
    },
    async (request, reply) => {
      reply.type('text/html');
      return LANDING_PAGE_HTML;
    }
  );

  app.get(
    '/health',
    {
      config: { rateLimit: false },
      schema: {
        tags: ['Operations'],
        summary: 'Liveness check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              version: { type: 'string' }
            }
          }
        }
      }
    },
    async () => ({ status: 'ok', version: '1.0.0' })
  );

  app.get(
    '/ready',
    {
      config: { rateLimit: false },
      schema: {
        tags: ['Operations'],
        summary: 'Readiness check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              linkedinConfigured: { type: 'boolean' }
            }
          }
        }
      }
    },
    async () => ({ status: 'ready', linkedinConfigured: env.linkedinConfigured })
  );

  app.post(
    '/v1/profiles/resolve',
    {
      schema: {
        tags: ['Profiles'],
        summary: 'Resolve a LinkedIn profile URL into structured JSON',
        body: {
          type: 'object',
          required: ['profileUrl'],
          properties: {
            profileUrl: {
              type: 'string',
              description: 'Public LinkedIn profile URL',
              examples: ['https://www.linkedin.com/in/williamhgates']
            }
          }
        }
      }
    },
    async (request) => {
      const { profileUrl } = resolveProfileBody.parse(request.body);
      const vanityName = extractVanityName(profileUrl);
      const data = await fetchProfileByVanity(vanityName, profileUrl);
      return { data, requestId: request.id };
    }
  );

  await app.ready();
  return app;
}
