import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { EventItem } from '@/lib/data/events';

export interface AssociationRecord {
  slug: string;
  shortName: string;
  name: string;
  country: string;
  region: 'Europe' | 'Middle East' | 'North America' | 'Asia-Pacific' | 'Latin America' | 'Africa';
  website: string;
  aliases: string[];
  logoFileName?: string;
}

export interface AssociationDirectoryItem extends AssociationRecord {
  logoSrc?: string;
  eventCount: number;
  calendarAssociation: string;
}

export const associationRecords: AssociationRecord[] = [
  {
    slug: 'oedv',
    shortName: 'ODV',
    name: 'ODV',
    country: 'Austria',
    region: 'Europe',
    website: 'https://www.oedv.at',
    aliases: ['ODV', 'ÖDV', 'OEDV'],
    logoFileName: 'oedv.png'
  },
  {
    slug: 'eurodet',
    shortName: 'EURODET',
    name: 'EURODET',
    country: 'Austria',
    region: 'Europe',
    website: 'https://www.eurodet.at',
    aliases: ['EURODET'],
    logoFileName: 'eurodet.png'
  },
  {
    slug: 'ckds',
    shortName: 'CKDS',
    name: 'CKDS',
    country: 'Czech Republic',
    region: 'Europe',
    website: 'https://ckds.cz',
    aliases: ['CKDS'],
    logoFileName: 'ckds.png'
  },
  {
    slug: 'fdde',
    shortName: 'FDDE',
    name: 'FDDE',
    country: 'Denmark',
    region: 'Europe',
    website: 'https://www.fdde.dk',
    aliases: ['FDDE'],
    logoFileName: 'fdde.png'
  },
  {
    slug: 'detective-association-of-finland',
    shortName: 'DAF',
    name: 'Detective Association of Finland',
    country: 'Finland',
    region: 'Europe',
    website: 'https://www.suomenyksityisetsivat.com',
    aliases: ['Detective Association of Finland', 'DAF'],
    logoFileName: 'daf.png'
  },
  {
    slug: 'syl',
    shortName: 'SYL',
    name: 'SYL',
    country: 'Finland',
    region: 'Europe',
    website: 'http://www.yksityisetsiva.fi/',
    aliases: ['SYL'],
    logoFileName: 'syl.png'
  },
  {
    slug: 'snarp',
    shortName: 'SNARP',
    name: 'SNARP',
    country: 'France',
    region: 'Europe',
    website: 'https://snarp.org/',
    aliases: ['SNARP'],
    logoFileName: 'snarp.png'
  },
  {
    slug: 'budeg',
    shortName: 'BuDEG',
    name: 'BuDEG',
    country: 'Germany',
    region: 'Europe',
    website: 'http://www.budeg.de/',
    aliases: ['BuDEG', 'BUDEG'],
    logoFileName: 'budeg.png'
  },
  {
    slug: 'hungarian-detective-association',
    shortName: 'HDA',
    name: 'Hungarian Detective Association',
    country: 'Hungary',
    region: 'Europe',
    website: 'https://detektivszovetseg.hu/',
    aliases: ['Hungarian Detective Association', 'HDA'],
    logoFileName: 'hda.png'
  },
  {
    slug: 'ibpi',
    shortName: 'IBPI',
    name: 'IBPI',
    country: 'Israel',
    region: 'Middle East',
    website: 'https://ipi.org.il/',
    aliases: ['IBPI', 'IPI'],
    logoFileName: 'ibpi.png'
  },
  {
    slug: 'federpol',
    shortName: 'FEDERPOL',
    name: 'FEDERPOL',
    country: 'Italy',
    region: 'Europe',
    website: 'https://www.federpol.it/',
    aliases: ['FEDERPOL'],
    logoFileName: 'federpol.png'
  },
  {
    slug: 'biznesa-drosiba',
    shortName: 'Biznesa Drosiba',
    name: 'Biznesa Drosiba',
    country: 'Latvia',
    region: 'Europe',
    website: 'https://www.businesecurity.lv/',
    aliases: ['Biznesa Drosiba', 'Biznesa Drošība', 'Single Member'],
    logoFileName: 'biznesa-drosiba.png'
  },
  {
    slug: 'nfes',
    shortName: 'NFES',
    name: 'NFES',
    country: 'Norway',
    region: 'Europe',
    website: 'https://nfes.no',
    aliases: ['NFES'],
    logoFileName: 'nfes.png'
  },
  {
    slug: 'psld',
    shortName: 'PSLD',
    name: 'PSLD',
    country: 'Poland',
    region: 'Europe',
    website: 'https://psld.pl/',
    aliases: ['PSLD'],
    logoFileName: 'psld.png'
  },
  {
    slug: 'lideppe',
    shortName: 'LIDEPPE',
    name: 'LIDEPPE',
    country: 'Portugal',
    region: 'Europe',
    website: 'https://lideppe.com/',
    aliases: ['LIDEPPE'],
    logoFileName: 'lideppe.png'
  },
  {
    slug: 'andr',
    shortName: 'ANDR',
    name: 'ANDR',
    country: 'Romania',
    region: 'Europe',
    website: 'http://www.adetro.eu/',
    aliases: ['ANDR'],
    logoFileName: 'andr.png'
  },
  {
    slug: 'pdpr',
    shortName: 'PDPR',
    name: 'PDPR',
    country: 'Romania',
    region: 'Europe',
    website: 'http://www.patronatul-detectivilor.ro/',
    aliases: ['PDPR'],
    logoFileName: 'pdpr.png'
  },
  {
    slug: 'ard',
    shortName: 'ARD',
    name: 'ARD',
    country: 'Russian Federation',
    region: 'Europe',
    website: 'https://www.ard.su/',
    aliases: ['ARD'],
    logoFileName: 'ard.png'
  },
  {
    slug: 'sad',
    shortName: 'SAD',
    name: 'SAD',
    country: 'Serbia',
    region: 'Europe',
    website: 'https://www.udruzenjedetektiva.rs/',
    aliases: ['SAD'],
    logoFileName: 'sad.png'
  },
  {
    slug: 'dzrs',
    shortName: 'DZRS',
    name: 'DZRS',
    country: 'Slovenia',
    region: 'Europe',
    website: 'https://www.detektivska-zbornica-rs.si/',
    aliases: ['DZRS'],
    logoFileName: 'dzrs.png'
  }
];

function getAssociationLogoMap() {
  const publicDir = path.join(process.cwd(), 'public', 'associations');

  if (!existsSync(publicDir)) {
    return new Map<string, string>();
  }

  const files = readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  return files.reduce((map, fileName) => {
    const parsed = path.parse(fileName);
    map.set(parsed.name.toLowerCase(), `/associations/${fileName}`);
    return map;
  }, new Map<string, string>());
}

export function findAssociationRecordByLabel(label: string) {
  const normalized = label.trim().toLowerCase();

  return associationRecords.find((association) => association.aliases.some((alias) => alias.trim().toLowerCase() === normalized)) ?? null;
}

export function getAssociationLogoSrc(label: string) {
  const association = findAssociationRecordByLabel(label);

  if (!association) {
    return undefined;
  }

  if (association.logoFileName) {
    return `/associations/${association.logoFileName}`;
  }

  const logoMap = getAssociationLogoMap();
  return logoMap.get(association.slug);
}

export function buildAssociationDirectory(events: EventItem[]): AssociationDirectoryItem[] {
  const logoMap = getAssociationLogoMap();

  return associationRecords.map((association) => {
    const matchedLabels = events
      .map((event) => event.association ?? event.organiser)
      .filter((label) => association.aliases.some((alias) => alias.toLowerCase() === label.trim().toLowerCase()));

    return {
      ...association,
      logoSrc: association.logoFileName ? `/associations/${association.logoFileName}` : logoMap.get(association.slug),
      eventCount: matchedLabels.length,
      calendarAssociation: matchedLabels[0] ?? association.name
    };
  });
}

export function getAssociationStats(items: AssociationDirectoryItem[]) {
  const countries = new Set(items.map((item) => item.country));
  const regions = new Set(items.map((item) => item.region));
  const liveCoverageAssociations = items.filter((item) => item.eventCount > 0).length;

  return {
    associationCount: items.length,
    countryCount: countries.size,
    regionCount: regions.size,
    liveCoverageAssociations
  };
}
