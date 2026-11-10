// Demo copy. Replace your site's name and marketing text here when the final content is available.
export const siteContent = {
  brand: 'Meovie',
  metaTitle: 'Movie & TV Streaming UI',
  metaDescription: 'Discover your next favorite story. Explore our movie collection.',
  hero: {
    eyebrow: 'A LITTLE ESCAPE. A GREAT STORY.',
    title: 'Discover your next great story',
    titleBeforeBrand: 'Experience with',
    description: ['Find a new favorite. Revisit an old one.', 'Movie & TV Streaming UI, all in one place.'],
    primaryAction: 'Get started',
    secondaryAction: 'Explore picks',
    caption: 'GOOD STORIES LOOK BETTER TOGETHER.',
    collectionLabel: '2026 PICKS',
    movieIds: ['odyssey', 'spider-man', 'toy-story', 'moana', 'apothecary'],
  },
  difference: {
    eyebrow: 'THE STREAMING EXPERIENCE',
    title: "What's different?",
    description: 'A little less searching. A lot more watching.',
    cards: [
      { title: 'Free to explore', description: ['Meet your next favorite.', 'No account needed for this preview.'] },
      { title: 'Your language', description: ['Discover stories from everywhere.', 'Find the details before you press play.'] },
      { title: 'Every kind of story', description: ['Big adventures. Little escapes.', 'A collection for every movie mood.'] },
    ],
  },
  taste: {
    eyebrow: 'PICKED FOR YOUR NEXT MOVIE NIGHT',
    title: 'Your taste',
    description: "A few stories we think you'll fall in love with.",
    movieIds: ['hoppers', 'frieren', 'social-reckoning', 'wildwood', 'witch-hat'],
  },
  feature: {
    eyebrow: 'TAKE A BREAK FROM THE EVERYDAY',
    title: ['Big adventures.', 'Even bigger', 'imaginations.'],
    description: "For the dreamers, the explorers, and the just-one-more-movie crowd. There's a story here for you.",
    action: 'Play a preview',
    movieId: 'hail-mary',
    caption: 'A little adventure goes a long way.',
  },
  popular: {
    eyebrow: 'FIND YOUR NEXT FAVORITE',
    title: 'Fresh releases',
    description: 'Good stories. Great company.',
    caption: '2026 releases. Scores are illustrative; playback uses a sample video.',
  },
  banner: {
    eyebrow: 'MAKE ROOM FOR A LITTLE MOVIE MAGIC',
    title: ['Your next movie night', 'starts right here.'],
    description: ['Discover a new world.', 'Find something worth staying in for.'],
    action: 'Explore the collection',
  },
  footer: {
    description: ['Movie & TV Streaming UI.', 'A place to find your next favorite.'],
    note: 'A streaming experience concept',
  },
} as const;
