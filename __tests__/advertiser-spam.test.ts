import { describe, it, expect } from 'vitest';
import { looksLikeRandomString } from '@/lib/utils/bot-filter';

describe('Advertiser form gibberish filter', () => {
  // The exact strings that reached the admin portal before the honeypot existed.
  const realSpam = [
    'haVMIpZwRXGrgZXmsbtAA', 'bqZVBjfLkiInWwwsVeATXll', 'onvmazGHPNluUTCCbsRjTZo',
    'LoNOIWFvPOQkXskxTMStoKb', 'yjMqKWXPXrTfsGpDgXq', 'rDhqSarUMVRCJHHb',
    'RLaFCojAhONpDMeKQdCPSv', 'cYRCuNTyAwubLprangox', 'WzUSHaIUXjzSRoktcyiXrOL',
    'TMBNISOYuMWkUOCZreWv',
  ];

  it.each(realSpam)('rejects %s', (value) => {
    expect(looksLikeRandomString(value)).toBe(true);
  });

  const realNames = [
    'Pinkerton', 'Investigations', 'KrollAssociates', 'IntelliCorp', 'Blackthorn',
    'SafeGuard', 'TrustedSource', 'ABCInvestigations', 'Surveillance', 'Crimestoppers',
  ];

  it.each(realNames)('accepts %s', (value) => {
    expect(looksLikeRandomString(value)).toBe(false);
  });
});
