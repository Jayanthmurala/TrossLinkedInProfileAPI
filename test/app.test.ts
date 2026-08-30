import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('LINKEDIN_LI_AT', 'test-li-at');
vi.stubEnv('LINKEDIN_JSESSIONID', 'ajax:test-jsession');

const { buildApp } = await import('../src/app.js');
const linkedin = await import('../src/lib/linkedin.js');

describe('LinkedIn Profile API', () => {
  let app: FastifyInstance;
  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  it('returns liveness status', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });

  it('rejects invalid profile URLs', async () => {
    app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/profiles/resolve',
      payload: { profileUrl: 'https://example.com/in/someone' }
    });
    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe('validation_error');
  });

  it('resolves a valid LinkedIn URL via Voyager client', async () => {
    vi.spyOn(linkedin, 'fetchProfileByVanity').mockResolvedValue({
      source: 'linkedin',
      profileUrl: 'https://www.linkedin.com/in/someone',
      vanityName: 'someone',
      identity: {
        id: 'urn:li:fsd_profile:abc',
        firstName: 'Some',
        lastName: 'One',
        fullName: 'Some One',
        avatarUrl: null
      },
      headline: 'Engineer',
      location: 'San Francisco Bay Area',
      about: 'About text',
      experience: [
        {
          title: 'Engineer',
          company: 'Acme',
          location: null,
          description: null,
          startDate: '2020-01',
          endDate: null,
          isCurrent: true
        }
      ],
      education: [],
      skills: ['TypeScript'],
      certifications: [],
      languages: []
    });

    app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/profiles/resolve',
      payload: { profileUrl: 'https://www.linkedin.com/in/someone' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.identity.fullName).toBe('Some One');
    expect(body.data.headline).toBe('Engineer');
    expect(body.data.skills).toContain('TypeScript');
    expect(linkedin.fetchProfileByVanity).toHaveBeenCalledWith(
      'someone',
      'https://www.linkedin.com/in/someone'
    );
  });
});
