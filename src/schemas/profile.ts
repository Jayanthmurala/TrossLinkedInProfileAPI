import { z } from 'zod';

export const resolveProfileBody = z.object({
  profileUrl: z.url().refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      /(^|\.)linkedin\.com$/i.test(url.hostname) &&
      /^\/in\/[^/]+\/?$/i.test(url.pathname)
    );
  }, 'profileUrl must be an HTTPS LinkedIn public profile URL, e.g. https://www.linkedin.com/in/name')
});

export function extractVanityName(profileUrl: string): string {
  const path = new URL(profileUrl).pathname;
  const match = path.match(/^\/in\/([^/]+)\/?$/i);
  if (!match) throw new Error('Invalid LinkedIn profile path');
  return decodeURIComponent(match[1]);
}

export type ProfileResponse = {
  source: 'linkedin';
  profileUrl: string;
  vanityName: string;
  identity: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
  headline: string | null;
  location: string | null;
  about: string | null;
  experience: Array<{
    title: string | null;
    company: string | null;
    location: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  }>;
  education: Array<{
    school: string | null;
    degree: string | null;
    fieldOfStudy: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  skills: string[];
  certifications: Array<{
    name: string | null;
    authority: string | null;
    licenseNumber: string | null;
    startDate: string | null;
    endDate: string | null;
    url: string | null;
  }>;
  languages: Array<{
    name: string | null;
    proficiency: string | null;
  }>;
};
