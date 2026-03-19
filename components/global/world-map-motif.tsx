export function WorldMapMotif() {
  return (
    <svg viewBox="0 0 1200 520" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="map-glow" cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor="rgba(184,228,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="map-route" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(77,163,255,0.04)" />
          <stop offset="45%" stopColor="rgba(184,228,255,0.42)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0.08)" />
        </linearGradient>
      </defs>

      <g opacity="0.22">
        <ellipse cx="600" cy="260" rx="448" ry="184" fill="url(#map-glow)" />
      </g>

      <g fill="none" stroke="rgba(184,228,255,0.1)" strokeWidth="1">
        <ellipse cx="600" cy="260" rx="430" ry="176" />
        <path d="M170 260H1030" />
        <path d="M208 198C364 223 488 234 600 234C712 234 836 223 992 198" />
        <path d="M208 322C364 297 488 286 600 286C712 286 836 297 992 322" />
        <path d="M264 148C404 185 500 201 600 201C700 201 796 185 936 148" />
        <path d="M264 372C404 335 500 319 600 319C700 319 796 335 936 372" />
        <path d="M312 113C420 159 507 180 600 180C693 180 780 159 888 113" />
        <path d="M312 407C420 361 507 340 600 340C693 340 780 361 888 407" />
        <path d="M388 102C356 165 340 211 340 260C340 309 356 355 388 418" />
        <path d="M494 90C474 154 464 207 464 260C464 313 474 366 494 430" />
        <path d="M600 84C600 146 600 203 600 260C600 317 600 374 600 436" />
        <path d="M706 90C726 154 736 207 736 260C736 313 726 366 706 430" />
        <path d="M812 102C844 165 860 211 860 260C860 309 844 355 812 418" />
      </g>

      <g fill="none" stroke="rgba(226,232,240,0.14)" strokeWidth="1">
        <path d="M90 250C140 210 190 210 245 225C275 235 300 260 330 255C375 248 398 212 445 210C490 208 525 238 568 245C620 254 665 245 706 224C751 201 768 180 814 176C846 173 872 183 899 199C944 226 991 236 1040 231C1075 227 1109 214 1140 197" />
        <path d="M335 318C368 292 398 281 438 283C488 286 514 315 557 324C594 331 624 320 653 302C692 279 717 267 758 267C798 267 825 283 860 303C902 327 943 335 986 330" />
        <path d="M827 357C856 341 884 339 911 348C936 356 956 375 979 389" />
      </g>

      <g stroke="url(#map-route)" strokeWidth="1.3" fill="none">
        <path d="M126 198Q560 102 1048 178" />
        <path d="M168 392Q560 304 1038 358" />
        <path d="M198 300Q544 158 968 252" />
      </g>

      <g fill="rgba(127,228,199,0.55)">
        <circle cx="242" cy="225" r="3" />
        <circle cx="446" cy="210" r="3" />
        <circle cx="706" cy="224" r="3" />
        <circle cx="900" cy="199" r="3" />
        <circle cx="986" cy="330" r="3" />
        <circle cx="764" cy="278" r="3" />
      </g>
    </svg>
  );
}
