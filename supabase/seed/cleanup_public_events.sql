begin;

delete from public.events
where
  website ilike '%example.com%'
  or coalesce(slug, '') not in (
    'professional-investigators-conference-2026',
    '66th-budeg-general-meeting-2026',
    'hit-the-hill-2026',
    '2026-intellenet-conference',
    'fewa-national-expert-witness-conference-2026',
    '69th-annual-convention-federpol',
    'ikd-general-assembly-2026',
    'ncapi-annual-conference',
    '2026-fali-conference',
    '2026-tali-conference',
    '2026-cali-annual-conference',
    'cii-asian-regional-meeting',
    'cii-western-us-regional-meeting',
    'cii-european-regional-meeting',
    'cii-agm-2026',
    'wad-conference-2026',
    'wad-conference-2027',
    'northern-branch-meeting',
    'southern-branch-meeting',
    'cali-webinar-artificial-intelligence-use-cases-for-private-investigators',
    'nlite-newly-licensed-investigator-training-and-education',
    'cali-legislative-day',
    'fali-cdin-monthly-lunchtime-chat-march-2026',
    'fali-panhandle-quarterly-meeting',
    'fali-cdin-monthly-lunchtime-chat-april-2026',
    'fali-cdin-monthly-lunchtime-chat-may-2026'
  );

commit;
