type AssociationBrandingRecord = {
  name: string;
  shortName: string;
  aliases: string[];
  logoFileName?: string;
  invertOnLight?: boolean;
};

const associationBrandingRecords: AssociationBrandingRecord[] = [
  {
    name: 'Association of British Investigators',
    shortName: 'ABI',
    aliases: ['Association of British Investigators', 'Association of British Investigators (ABI)', 'ABI'],
    logoFileName: 'abi.png',
    invertOnLight: true
  },
  { name: 'WAD', shortName: 'WAD', aliases: ['WAD', 'World Association of Detectives'], logoFileName: 'wad.png' },
  {
    name: 'IKD',
    shortName: 'IKD',
    aliases: ['IKD', 'Internationale Kommission der Detektiv-Verbande', 'Internationale Kommission der Detektiv-Verbände', 'IKD / FEDERPOL'],
    logoFileName: 'ikd.png'
  },
  { name: 'ODV', shortName: 'ODV', aliases: ['ODV', 'ÖDV', 'OEDV'], logoFileName: 'oedv.png' },
  { name: 'EURODET', shortName: 'EURODET', aliases: ['EURODET'], logoFileName: 'eurodet.png' },
  { name: 'CKDS', shortName: 'CKDS', aliases: ['CKDS'], logoFileName: 'ckds.png' },
  { name: 'FDDE', shortName: 'FDDE', aliases: ['FDDE'], logoFileName: 'fdde.png' },
  { name: 'Detective Association of Finland', shortName: 'DAF', aliases: ['Detective Association of Finland', 'DAF'], logoFileName: 'daf.png' },
  { name: 'SYL', shortName: 'SYL', aliases: ['SYL'], logoFileName: 'syl.png' },
  { name: 'SNARP', shortName: 'SNARP', aliases: ['SNARP'], logoFileName: 'snarp.png' },
  { name: 'BuDEG', shortName: 'BuDEG', aliases: ['BuDEG', 'BUDEG'], logoFileName: 'budeg.png' },
  { name: 'Hungarian Detective Association', shortName: 'HDA', aliases: ['Hungarian Detective Association', 'HDA'], logoFileName: 'hda.png' },
  { name: 'IBPI', shortName: 'IBPI', aliases: ['IBPI', 'IPI'], logoFileName: 'ibpi.png' },
  { name: 'FEDERPOL', shortName: 'FEDERPOL', aliases: ['FEDERPOL'], logoFileName: 'federpol.png' },
  { name: 'Biznesa Drosiba', shortName: 'Biznesa Drosiba', aliases: ['Biznesa Drosiba', 'Biznesa Drošība', 'Single Member'], logoFileName: 'biznesa-drosiba.png' },
  { name: 'NFES', shortName: 'NFES', aliases: ['NFES'], logoFileName: 'nfes.png' },
  { name: 'PSLD', shortName: 'PSLD', aliases: ['PSLD'], logoFileName: 'psld.png' },
  { name: 'LIDEPPE', shortName: 'LIDEPPE', aliases: ['LIDEPPE'], logoFileName: 'lideppe.png' },
  { name: 'ANDR', shortName: 'ANDR', aliases: ['ANDR'], logoFileName: 'andr.png' },
  { name: 'PDPR', shortName: 'PDPR', aliases: ['PDPR'], logoFileName: 'pdpr.png' },
  { name: 'ARD', shortName: 'ARD', aliases: ['ARD'], logoFileName: 'ard.png' },
  { name: 'SAD', shortName: 'SAD', aliases: ['SAD'], logoFileName: 'sad.png' },
  { name: 'DeZRS', shortName: 'DeZRS', aliases: ['DeZRS', 'DZRS'], logoFileName: 'dzrs.png' },
  { name: 'CII', shortName: 'CII', aliases: ['CII', 'Council of International Investigators'], logoFileName: 'cii.png' },
  { name: 'Intellenet', shortName: 'Intellenet', aliases: ['Intellenet', 'INTELLENET'], logoFileName: 'intellenet.png' },
  { name: 'APDPE', shortName: 'APDPE', aliases: ['APDPE'], logoFileName: 'apdpe.png' },
  { name: 'APDU', shortName: 'APDU', aliases: ['APDU'], logoFileName: 'apdu.png' },
  { name: 'FAPI', shortName: 'FAPI', aliases: ['FAPI'], logoFileName: 'fapi.png' },
  { name: 'FSPD', shortName: 'FSPD', aliases: ['FSPD'], logoFileName: 'fspd.png' },
  { name: 'IAIACE', shortName: 'IAIACE', aliases: ['IAIACE'], logoFileName: 'iaiace.png' },
  { name: 'SFPP', shortName: 'SFPP', aliases: ['SFPP'], logoFileName: 'sfpp.png' },
  { name: 'CALI', shortName: 'CALI', aliases: ['CALI', 'California Association of Licensed Investigators'], logoFileName: 'cali.png' },
  { name: 'FALI', shortName: 'FALI', aliases: ['FALI', 'Florida Association of Licensed Investigators'], logoFileName: 'fali.png' },
  { name: 'FEWA', shortName: 'FEWA', aliases: ['FEWA', 'Forensic Expert Witness Association'], logoFileName: 'fewa.png' },
  { name: 'NCAPI', shortName: 'NCAPI', aliases: ['NCAPI', 'North Carolina Association of Private Investigators'], logoFileName: 'ncapi.png' },
  { name: 'NCISS', shortName: 'NCISS', aliases: ['NCISS', 'National Council of Investigation & Security Services'], logoFileName: 'nciss.png' },
  { name: 'TALI', shortName: 'TALI', aliases: ['TALI', 'Texas Association of Licensed Investigators'], logoFileName: 'tali.png' },
  { name: 'National Association of Legal Investigators', shortName: 'NALI', aliases: ['NALI', 'National Association of Legal Investigators'], logoFileName: 'nali.webp' },
  { name: 'Associated Licensed Detectives of New York State', shortName: 'ALDONYS', aliases: ['ALDONYS', 'Associated Licensed Detectives of New York State'], logoFileName: 'aldonys.png' },
  { name: 'World Association of Professional Investigators', shortName: 'WAPI', aliases: ['WAPI', 'World Association of Professional Investigators'], logoFileName: 'wapi.webp' },
  { name: 'Society of Professional Investigators', shortName: 'SPI', aliases: ['SPI', 'Society of Professional Investigators'], logoFileName: 'spi.png' },
  { name: 'ACFE', shortName: 'ACFE', aliases: ['ACFE', 'Association of Certified Fraud Examiners'], logoFileName: 'acfe.png' },
  { name: 'SCALI', shortName: 'SCALI', aliases: ['SCALI', 'South Carolina Association of Legal Investigators'], logoFileName: 'scali.png' },
  { name: 'MAPI', shortName: 'MAPI', aliases: ['MAPI', 'Minnesota Association of Private Investigators'], logoFileName: 'mapi.png' },
  { name: 'CAJP', shortName: 'CAJP', aliases: ['CAJP', 'California Association of Judgment Professionals'], logoFileName: 'cajp.png' },
  { name: 'SCFIA', shortName: 'SCFIA', aliases: ['SCFIA', 'Southern California Fraud Investigators Association'], logoFileName: 'scfia.jpg' },
  { name: 'GAPPI', shortName: 'GAPPI', aliases: ['GAPPI', 'Georgia Association of Professional Private Investigators'], logoFileName: 'gappi.png' },
  { name: 'PIAI', shortName: 'PIAI', aliases: ['PIAI', 'Private Investigators Association of Idaho'], logoFileName: 'piai.png' },
  { name: 'PAWLI', shortName: 'PAWLI', aliases: ['PAWLI', 'Professional Association of Wisconsin Licensed Investigators'], logoFileName: 'pawli.png' },
  { name: 'OALI', shortName: 'OALI', aliases: ['OALI', 'Oregon Association of Licensed Investigators'], logoFileName: 'oali.png' },
  { name: 'ASIS International', shortName: 'ASIS', aliases: ['ASIS', 'ASIS International'], logoFileName: 'asis.png' },
  { name: 'PBSA', shortName: 'PBSA', aliases: ['PBSA', 'Professional Background Screening Association'], logoFileName: 'pbsa.png' },
  { name: 'AWI', shortName: 'AWI', aliases: ['AWI', 'Association of Workplace Investigators'], logoFileName: 'awi.png' },
  { name: 'Taiwan Association of Professional Detectives', shortName: 'TAPD', aliases: ['TAPD', 'Taiwan Association of Professional Detectives', 'Taiwan Detective Association'], logoFileName: 'tapd.png' }
];

export function findAssociationBranding(label: string) {
  const normalized = label.trim().toLowerCase();
  return (
    associationBrandingRecords.find((association) =>
      association.aliases.some((alias) => alias.trim().toLowerCase() === normalized)
    ) ?? null
  );
}

export function getAssociationBrandLogoSrc(label: string) {
  const association = findAssociationBranding(label);
  return association?.logoFileName ? `/associations/${association.logoFileName}` : undefined;
}

export function shouldInvertLogoOnLight(label: string) {
  const association = findAssociationBranding(label);
  return association?.invertOnLight ?? false;
}

export function getAssociationBadgeLabel(label: string) {
  const association = findAssociationBranding(label);
  if (association?.shortName) {
    return association.shortName;
  }

  const words = label
    .split(/[\s/&,-]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const acronym = words
    .slice(0, 4)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return acronym || label.slice(0, 3).toUpperCase();
}

export function getAssociationDisplayName(label: string) {
  return findAssociationBranding(label)?.shortName ?? label;
}

export function getAssociationBrandingCount() {
  return associationBrandingRecords.length;
}
