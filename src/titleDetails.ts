export interface TitleDetails {
  leadLabel: 'Director' | 'Directors' | 'Creators' | 'Original creators';
  leads: string[];
  cast: string[];
  country: string;
  seasonEpisodeCounts?: number[];
}

// shortcut: credits are curated; season and episode entries are demo data until the title API is connected.
export const titleDetails: Record<string, TitleDetails> = {
  digger: { leadLabel: 'Director', leads: ['Alejandro G. Iñárritu'], cast: ['Tom Cruise', 'Riz Ahmed', 'John Goodman', 'Sandra Hüller'], country: 'United States' },
  'toy-story': { leadLabel: 'Director', leads: ['Andrew Stanton'], cast: ['Tom Hanks', 'Tim Allen', 'Joan Cusack', 'Greta Lee'], country: 'United States' },
  'spider-man': { leadLabel: 'Director', leads: ['Destin Daniel Cretton'], cast: ['Tom Holland', 'Zendaya', 'Sadie Sink', 'Jon Bernthal'], country: 'United States' },
  irregular: { leadLabel: 'Director', leads: ['Jimmy Stone'], cast: ['Yuichi Nakamura', 'Saori Hayami', 'Chiwa Saito', 'Daisuke Ono'], country: 'Japan' },
  'social-reckoning': { leadLabel: 'Director', leads: ['Aaron Sorkin'], cast: ['Mikey Madison', 'Jeremy Allen White', 'Jeremy Strong', 'Wunmi Mosaku'], country: 'United States' },
  hoppers: { leadLabel: 'Director', leads: ['Daniel Chong'], cast: ['Piper Curda', 'Bobby Moynihan', 'Jon Hamm', 'Meryl Streep'], country: 'United States' },
  'resident-evil': { leadLabel: 'Director', leads: ['Zach Cregger'], cast: ['Austin Abrams', 'Zach Cherry', 'Kali Reis', 'Paul Walter Hauser'], country: 'United States · Germany · France' },
  apothecary: { leadLabel: 'Original creators', leads: ['Natsu Hyuga', 'Touko Shino'], cast: ['Aoi Yuki', 'Takeo Otsuka', 'Atsumi Tanezaki', 'Katsuyuki Konishi'], country: 'Japan', seasonEpisodeCounts: [24, 24, 12] },
  odyssey: { leadLabel: 'Director', leads: ['Christopher Nolan'], cast: ['Matt Damon', 'Tom Holland', 'Anne Hathaway', 'Robert Pattinson'], country: 'United States · United Kingdom' },
  mario: { leadLabel: 'Directors', leads: ['Aaron Horvath', 'Michael Jelenic'], cast: ['Chris Pratt', 'Anya Taylor-Joy', 'Charlie Day', 'Jack Black'], country: 'United States' },
  'hail-mary': { leadLabel: 'Directors', leads: ['Phil Lord', 'Christopher Miller'], cast: ['Ryan Gosling', 'Sandra Hüller', 'James Ortiz', 'Lionel Boyce'], country: 'United States' },
  'witch-hat': { leadLabel: 'Original creators', leads: ['Kamome Shirahama'], cast: ['Rena Motomura', 'Natsuki Hanae', 'Hibiku Yamamura', 'Kurumi Haruki'], country: 'Japan', seasonEpisodeCounts: [13] },
  supergirl: { leadLabel: 'Director', leads: ['Craig Gillespie'], cast: ['Milly Alcock', 'Matthias Schoenaerts', 'Eve Ridley', 'Jason Momoa'], country: 'United States' },
  wildwood: { leadLabel: 'Director', leads: ['Travis Knight'], cast: ['Carey Mulligan', 'Peyton Elizabeth Lee', 'Jacob Tremblay', 'Richard E. Grant'], country: 'United States' },
  moana: { leadLabel: 'Director', leads: ['Thomas Kail'], cast: ["Catherine Laga'aia", 'Dwayne Johnson', 'Rena Owen', 'John Tui'], country: 'United States' },
  frieren: { leadLabel: 'Original creators', leads: ['Kanehito Yamada', 'Tsukasa Abe'], cast: ['Atsumi Tanezaki', 'Kana Ichinose', 'Chiaki Kobayashi', 'Nobuhiko Okamoto'], country: 'Japan', seasonEpisodeCounts: [28, 10] },
  prada: { leadLabel: 'Director', leads: ['David Frankel'], cast: ['Meryl Streep', 'Anne Hathaway', 'Emily Blunt', 'Stanley Tucci'], country: 'United States' },
  minions: { leadLabel: 'Director', leads: ['Pierre Coffin'], cast: ['Pierre Coffin', 'Trey Parker', 'Allison Janney', 'Christoph Waltz'], country: 'United States' },
  dragons: { leadLabel: 'Creators', leads: ['Ryan Condal', 'George R. R. Martin'], cast: ['Matt Smith', "Emma D'Arcy", 'Olivia Cooke', 'Steve Toussaint'], country: 'United States', seasonEpisodeCounts: [10, 8, 8] },
  'one-piece': { leadLabel: 'Creators', leads: ['Matt Owens', 'Steven Maeda'], cast: ['Iñaki Godoy', 'Emily Rudd', 'Mackenyu', 'Taz Skylar'], country: 'United States', seasonEpisodeCounts: [8, 8] },
  verity: { leadLabel: 'Director', leads: ['Michael Showalter'], cast: ['Anne Hathaway', 'Dakota Johnson', 'Josh Hartnett', 'Ismael Cruz Córdova'], country: 'United States' },
  clayface: { leadLabel: 'Director', leads: ['James Watkins'], cast: ['Tom Rhys Harries', 'Naomi Ackie', 'David Dencik', 'Max Minghella'], country: 'United States' },
  'practical-magic': { leadLabel: 'Director', leads: ['Susanne Bier'], cast: ['Sandra Bullock', 'Nicole Kidman', 'Joey King', 'Lee Pace'], country: 'United States' },
};
