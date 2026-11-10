export function Icon({ name, className }: { name: 'arrow' | 'search' | 'play' | 'close' | 'clock' | 'calendar' | 'globe'; className?: string }) {
  return <svg className={className} aria-hidden="true"><use href={`#${name}`} /></svg>;
}

export function IconDefinitions() {
  return <svg className="svg-defs" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <symbol id="arrow" viewBox="0 0 32 24"><path d="M2 12h27M19 2l10 10-10 10" /></symbol>
    <symbol id="search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></symbol>
    <symbol id="play" viewBox="0 0 24 24"><path d="m9 5 12 7-12 7Z" /></symbol>
    <symbol id="close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></symbol>
    <symbol id="clock" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="6" /><path d="M12 7v6h5" /></symbol>
    <symbol id="calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="4" /><path d="M7 2v5m10-5v5M3 11h18m-13 4h.01m4 0h.01m4 0h.01m-8 3h.01m4 0h.01" /></symbol>
    <symbol id="globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" /></symbol>
  </svg>;
}
