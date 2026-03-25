type AssociationBrandingRecord = {
  name: string;
  shortName: string;
  aliases: string[];
  logoFileName?: string;
};

const associationBrandingRecords: AssociationBrandingRecord[] = [
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
  { name: 'DZRS', shortName: 'DZRS', aliases: ['DZRS'], logoFileName: 'dzrs.png' }
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
