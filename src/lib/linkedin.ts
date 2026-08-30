import { env } from '../config/env.js';
import { AppError } from './errors.js';
import type { ProfileResponse } from '../schemas/profile.js';

const BASE = 'https://www.linkedin.com/voyager/api';

/** Decoration LinkedIn rotates; try newest-ish first. */
const DECORATIONS = [
  'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-93',
  'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-85',
  'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-57',
  'com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-35',
  'com.linkedin.voyager.dash.deco.identity.profile.FullProfile-76',
  'com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore-16'
];

type Json = Record<string, unknown>;

function headers(): HeadersInit {
  const jsid = env.jsessionid!;
  return {
    Accept: 'application/vnd.linkedin.normalized+json+2.1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'csrf-token': jsid,
    Cookie: `li_at=${env.LINKEDIN_LI_AT}; JSESSIONID="${jsid}"`,
    'x-restli-protocol-version': '2.0.0',
    'x-li-lang': 'en_US',
    Origin: 'https://www.linkedin.com',
    Referer: 'https://www.linkedin.com/'
  };
}

function sessionExpired(): never {
  throw new AppError(
    401,
    'linkedin_session_expired',
    'LinkedIn redirected or rejected the session (cookies expired). Copy fresh li_at + JSESSIONID into .env and restart.'
  );
}

async function voyagerGet(pathAndQuery: string): Promise<{ status: number; body: Json; location?: string | null }> {
  if (!env.linkedinConfigured) {
    throw new AppError(503, 'linkedin_not_configured', 'Set LINKEDIN_LI_AT and LINKEDIN_JSESSIONID in the environment.');
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${pathAndQuery}`, {
      headers: headers(),
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000)
    });
  } catch {
    throw new AppError(502, 'linkedin_unavailable', 'LinkedIn could not be reached. Please try again.');
  }

  // 302/301 → usually login/checkpoint when li_at is dead
  if ([301, 302, 303, 307, 308].includes(response.status) || response.status === 401 || response.status === 403) {
    sessionExpired();
  }

  let body: Json = {};
  try {
    body = (await response.json()) as Json;
  } catch {
    body = {};
  }
  return { status: response.status, body, location: response.headers.get('location') };
}

function asArray(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

function text(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object' && 'text' in (value as Json) && typeof (value as Json).text === 'string') {
    const t = ((value as Json).text as string).trim();
    return t || null;
  }
  return null;
}

function dateLabel(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const d = value as { year?: number; month?: number; day?: number };
  if (!d.year) return null;
  const month = d.month ? String(d.month).padStart(2, '0') : null;
  const day = d.day ? String(d.day).padStart(2, '0') : null;
  return [d.year, month, day].filter(Boolean).join('-');
}

function pictureUrl(entity: Json | undefined): string | null {
  if (!entity) return null;
  const vector = (entity.profilePicture ?? entity.displayImage ?? entity.logo) as Json | undefined;
  const root = (vector?.displayImageReference ?? vector?.displayImageWithFrameReference ?? vector) as Json | undefined;
  const soft = (root?.vectorImage ?? root) as Json | undefined;
  const artifacts = asArray(soft?.artifacts);
  if (!artifacts.length) {
    const picture = entity.picture as Json | undefined;
    const older = asArray(picture?.artifacts);
    if (picture?.rootUrl && older.length) {
      const best = older[older.length - 1] as { fileIdentifyingUrlPathSegment?: string };
      return `${picture.rootUrl}${best.fileIdentifyingUrlPathSegment ?? ''}`;
    }
    return null;
  }
  const rootUrl = soft?.rootUrl as string | undefined;
  const best = artifacts[artifacts.length - 1] as { fileIdentifyingUrlPathSegment?: string };
  if (rootUrl && best?.fileIdentifyingUrlPathSegment) return `${rootUrl}${best.fileIdentifyingUrlPathSegment}`;
  return null;
}

function ofType(included: Json[], typeSuffix: string): Json[] {
  return included.filter((item) => typeof item.$type === 'string' && (item.$type as string).endsWith(typeSuffix));
}

function byUrnMap(included: Json[]): Map<string, Json> {
  const map = new Map<string, Json>();
  for (const item of included) {
    if (typeof item.entityUrn === 'string') map.set(item.entityUrn, item);
  }
  return map;
}

function companyName(position: Json, byUrn: Map<string, Json>): string | null {
  if (text(position.companyName)) return text(position.companyName);
  const company = position.company as Json | undefined;
  if (company && typeof company === 'object') {
    return text(company.name) ?? text((company.miniCompany as Json | undefined)?.name);
  }
  const urn = position.companyUrn as string | undefined;
  if (typeof urn === 'string' && byUrn.has(urn)) return text(byUrn.get(urn)!.name);
  return null;
}

function expandElements(node: unknown, byUrn: Map<string, Json>): Json[] {
  if (!node || typeof node !== 'object') return [];
  const elements = asArray((node as Json).elements);
  return elements.flatMap((ref) => {
    if (typeof ref === 'string') return byUrn.has(ref) ? [byUrn.get(ref)!] : [];
    if (ref && typeof ref === 'object') return [ref as Json];
    return [];
  });
}

async function fetchDashProfile(vanityName: string): Promise<Json> {
  const encoded = encodeURIComponent(vanityName);
  let lastStatus = 0;

  for (const decoration of DECORATIONS) {
    // decorationId must stay unencoded (dots/hyphens); only vanity is encoded
    const { status, body } = await voyagerGet(
      `/identity/dash/profiles?q=memberIdentity&memberIdentity=${encoded}&decorationId=${decoration}`
    );
    lastStatus = status;
    if (status === 404) {
      throw new AppError(404, 'profile_not_found', 'That LinkedIn profile was not found (or is not visible to this session).');
    }
    if (status === 410 || status === 400) continue;
    if (status < 200 || status >= 300) continue;

    const elements = asArray(body.elements);
    const included = asArray(body.included);
    if (elements.length || included.length) return body;
  }

  if (lastStatus === 410) {
    throw new AppError(502, 'linkedin_endpoint_gone', 'LinkedIn retired the profile endpoints this service uses. Cookies may be fine; the API shape changed.');
  }
  throw new AppError(502, 'linkedin_request_failed', `LinkedIn returned HTTP ${lastStatus || 'unknown'}.`);
}

/**
 * Reverse-engineered Voyager dash profiles API (profileView is gone / HTTP 410).
 * Requires a valid browser session (li_at + JSESSIONID) from your own LinkedIn account.
 */
export async function fetchProfileByVanity(vanityName: string, profileUrl: string): Promise<ProfileResponse> {
  const body = await fetchDashProfile(vanityName);
  const included = asArray(body.included);
  const byUrn = byUrnMap(included);
  const elements = asArray(body.elements).map((el) =>
    typeof el === 'string' ? byUrn.get(el) ?? { entityUrn: el } : el
  );

  const profile =
    elements.find((i) => i.publicIdentifier === vanityName) ??
    included.find((i) => i.publicIdentifier === vanityName) ??
    ofType(included, 'identity.profile.Profile')[0] ??
    elements[0];

  if (!profile || (!profile.firstName && !profile.publicIdentifier && !profile.entityUrn)) {
    throw new AppError(404, 'profile_not_found', 'LinkedIn returned no profile entity for that URL.');
  }

  const firstName = text(profile.firstName);
  const lastName = text(profile.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || text(profile.fullName);

  const positionGroups = [
    ...ofType(included, 'identity.profile.PositionGroup'),
    ...expandElements(profile.profilePositionGroups, byUrn)
  ];
  const positions = [
    ...ofType(included, 'identity.profile.Position'),
    ...positionGroups.flatMap((g) => expandElements(g.profilePositionInPositionGroup ?? g.positions ?? g, byUrn))
  ];

  const seenPos = new Set<string>();
  const experience = positions
    .filter((p) => {
      if (!text(p.title) && !companyName(p, byUrn)) return false;
      const urn = p.entityUrn as string | undefined;
      if (!urn) return true;
      if (seenPos.has(urn)) return false;
      seenPos.add(urn);
      return true;
    })
    .map((p) => {
      const time = (p.dateRange ?? p.timePeriod ?? {}) as Json;
      const end = time.end ?? time.endDate;
      return {
        title: text(p.title),
        company: companyName(p, byUrn),
        location: text(p.locationName) ?? text(p.geoLocationName) ?? text(p.location),
        description: text(p.description),
        startDate: dateLabel(time.start ?? time.startDate),
        endDate: end ? dateLabel(end) : null,
        isCurrent: !end
      };
    });

  const educations = [
    ...ofType(included, 'identity.profile.Education'),
    ...expandElements(profile.profileEducations, byUrn)
  ];
  const seenEdu = new Set<string>();
  const education = educations
    .filter((e) => {
      const urn = e.entityUrn as string | undefined;
      if (!urn) return true;
      if (seenEdu.has(urn)) return false;
      seenEdu.add(urn);
      return true;
    })
    .map((e) => {
      const time = (e.dateRange ?? e.timePeriod ?? {}) as Json;
      const school =
        text(e.schoolName) ??
        (typeof e.school === 'string' ? text(byUrn.get(e.school)?.name) : text((e.school as Json | undefined)?.name));
      return {
        school,
        degree: text(e.degreeName) ?? text(e.degree),
        fieldOfStudy: text(e.fieldOfStudy),
        description: text(e.description),
        startDate: dateLabel(time.start ?? time.startDate),
        endDate: dateLabel(time.end ?? time.endDate)
      };
    });

  const skillEntities = [
    ...ofType(included, 'identity.profile.Skill'),
    ...expandElements(profile.profileSkills, byUrn)
  ];
  const skills = [
    ...new Set(
      skillEntities
        .map((s) => text(s.name) ?? text((s.skill as Json | undefined)?.name))
        .filter((s): s is string => Boolean(s))
    )
  ];

  const certEntities = [
    ...ofType(included, 'identity.profile.Certification'),
    ...expandElements(profile.profileCertifications, byUrn)
  ];
  const certifications = certEntities.map((c) => {
    const time = (c.dateRange ?? c.timePeriod ?? {}) as Json;
    return {
      name: text(c.name),
      authority: text(c.authority) ?? text((c.company as Json | undefined)?.name),
      licenseNumber: text(c.licenseNumber),
      startDate: dateLabel(time.start ?? time.startDate),
      endDate: dateLabel(time.end ?? time.endDate),
      url: text(c.url)
    };
  });

  const languageEntities = [
    ...ofType(included, 'identity.profile.Language'),
    ...expandElements(profile.profileLanguages, byUrn)
  ];
  const languages = languageEntities.map((l) => ({
    name: text(l.name),
    proficiency: text(l.proficiency)
  }));

  const geoLocation = profile.geoLocation as Json | undefined;
  const geo =
    text(profile.geoLocationName) ??
    text(profile.locationName) ??
    text(geoLocation?.geo) ??
    text((geoLocation?.defaultLocalizedName as Json | undefined) ?? geoLocation?.defaultLocalizedName) ??
    text((profile.location as Json | undefined)?.countryCode) ??
    null;

  return {
    source: 'linkedin',
    profileUrl,
    vanityName,
    identity: {
      id: text(profile.entityUrn) ?? text(profile.objectUrn),
      firstName,
      lastName,
      fullName: fullName || null,
      avatarUrl: pictureUrl(profile)
    },
    headline: text(profile.headline),
    location: geo,
    about: text(profile.summary) ?? text(profile.about),
    experience,
    education,
    skills,
    certifications,
    languages
  };
}
