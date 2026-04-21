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
  hasPage?: boolean;
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
    shortName: 'DeZRS',
    name: 'DeZRS',
    country: 'Slovenia',
    region: 'Europe',
    website: 'https://www.detektivska-zbornica-rs.si/',
    aliases: ['DeZRS', 'DZRS'],
    logoFileName: 'dzrs.png'
  },
  // ── Major International ──
  {
    slug: 'abi',
    shortName: 'ABI',
    name: 'Association of British Investigators',
    country: 'United Kingdom',
    region: 'Europe',
    website: 'https://www.theabi.org.uk',
    aliases: ['ABI', 'Association of British Investigators', 'Association of British Investigators (ABI)'],
    logoFileName: 'abi.png'
  },
  {
    slug: 'wad',
    shortName: 'WAD',
    name: 'World Association of Detectives',
    country: 'United States',
    region: 'North America',
    website: 'https://www.wad.net',
    aliases: ['WAD', 'World Association of Detectives'],
    logoFileName: 'wad.png'
  },
  {
    slug: 'ikd',
    shortName: 'IKD',
    name: 'Internationale Kommission der Detektiv-Verbände',
    country: 'Austria',
    region: 'Europe',
    website: 'https://www.i-k-d.com',
    aliases: ['IKD', 'Internationale Kommission der Detektiv-Verbande', 'Internationale Kommission der Detektiv-Verbände'],
    logoFileName: 'ikd.png'
  },
  // ── Additional European ──
  {
    slug: 'apdpe',
    shortName: 'APDPE',
    name: 'APDPE',
    country: 'Spain',
    region: 'Europe',
    website: 'https://www.apdpe.es',
    aliases: ['APDPE'],
    logoFileName: 'apdpe.png'
  },
  {
    slug: 'apdu',
    shortName: 'APDU',
    name: 'APDU',
    country: 'Ukraine',
    region: 'Europe',
    website: 'https://www.apdu.pt',
    aliases: ['APDU'],
    logoFileName: 'apdu.png'
  },
  {
    slug: 'fapi',
    shortName: 'FAPI',
    name: 'FAPI',
    country: 'Italy',
    region: 'Europe',
    website: 'https://www.fapi.it',
    aliases: ['FAPI'],
    logoFileName: 'fapi.png'
  },
  {
    slug: 'fspd',
    shortName: 'FSPD',
    name: 'FSPD',
    country: 'Switzerland',
    region: 'Europe',
    website: 'https://www.fspd.ch',
    aliases: ['FSPD'],
    logoFileName: 'fspd.png'
  },
  {
    slug: 'iaiace',
    shortName: 'IAIACE',
    name: 'IAIACE',
    country: 'Belgium',
    region: 'Europe',
    website: 'https://www.iaiace.be',
    aliases: ['IAIACE'],
    logoFileName: 'iaiace.png'
  },
  {
    slug: 'sfpp',
    shortName: 'SFPP',
    name: 'SFPP',
    country: 'France',
    region: 'Europe',
    website: 'https://www.sfpp.fr',
    aliases: ['SFPP'],
    logoFileName: 'sfpp.png'
  },
  // ── North America ──
  {
    slug: 'intellenet',
    shortName: 'Intellenet',
    name: 'International Intelligence Network',
    country: 'United States',
    region: 'North America',
    website: 'https://www.intellenetwork.org',
    aliases: ['Intellenet', 'INTELLENET'],
    logoFileName: 'intellenet.png'
  },
  {
    slug: 'cii',
    shortName: 'CII',
    name: 'Council of International Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://www.cii2.org',
    aliases: ['CII', 'Council of International Investigators'],
    logoFileName: 'cii.png'
  },
  {
    slug: 'fali',
    shortName: 'FALI',
    name: 'Florida Association of Licensed Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://www.fali.org',
    aliases: ['FALI'],
    logoFileName: 'fali.png'
  },
  {
    slug: 'cali',
    shortName: 'CALI',
    name: 'California Association of Licensed Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://www.cali-pi.org',
    aliases: ['CALI'],
    logoFileName: 'cali.png'
  },
  {
    slug: 'ncapi',
    shortName: 'NCAPI',
    name: 'North Carolina Association of Private Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://www.ncapi.org',
    aliases: ['NCAPI'],
    logoFileName: 'ncapi.png'
  },
  {
    slug: 'tali',
    shortName: 'TALI',
    name: 'Texas Association of Licensed Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://www.tali.org',
    aliases: ['TALI'],
    logoFileName: 'tali.png'
  },
  {
    slug: 'nciss',
    shortName: 'NCISS',
    name: 'National Council of Investigation & Security Services',
    country: 'United States',
    region: 'North America',
    website: 'https://www.nciss.org',
    aliases: ['NCISS'],
    logoFileName: 'nciss.png'
  },
  {
    slug: 'fewa',
    shortName: 'FEWA',
    name: 'Forensic Expert Witness Association',
    country: 'United States',
    region: 'North America',
    website: 'https://www.fewa.org',
    aliases: ['FEWA'],
    logoFileName: 'fewa.png'
  },
  {
    slug: 'aldonys',
    shortName: 'ALDONYS',
    name: 'Associated Licensed Detectives of New York State',
    country: 'United States',
    region: 'North America',
    website: 'https://aldonys.org/',
    aliases: ['ALDONYS', 'Associated Licensed Detectives of New York State'],
    logoFileName: 'aldonys.png'
  },
  {
    slug: 'nali',
    shortName: 'NALI',
    name: 'National Association of Legal Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://nalionline.org/',
    aliases: ['NALI', 'National Association of Legal Investigators'],
    logoFileName: 'nali.webp'
  },
  {
    slug: 'wapi',
    shortName: 'WAPI',
    name: 'World Association of Professional Investigators',
    country: 'United Kingdom',
    region: 'Europe',
    website: 'https://wapi.org/',
    aliases: ['WAPI', 'World Association of Professional Investigators'],
    logoFileName: 'wapi.webp'
  },
  {
    slug: 'spi',
    shortName: 'SPI',
    name: 'Society of Professional Investigators',
    country: 'United States',
    region: 'North America',
    website: 'https://spinyc.org/',
    aliases: ['SPI', 'Society of Professional Investigators'],
    logoFileName: 'spi.png'
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
