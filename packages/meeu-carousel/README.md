# Meeu Carousel

Two cinematic React carousels from [React Movie UI](https://github.com/rihwwn/react-movie-ui): expanding hero cards and curved recommendations. TypeScript declarations and scoped CSS are included. React is the only runtime peer dependency; no API client, provider, font, movie artwork or app branding is bundled.

## Install

The package lives in this repository. It is distributed as an installable GitHub release archive; it is not currently published to the npm registry.

```sh
npm install https://github.com/rihwwn/react-movie-ui/releases/download/meeu-carousel-v0.1.0/rihwwn-meeu-carousel-0.1.0.tgz
```

Or build and pack it from a checkout:

```sh
npm ci
npm run pack:carousel
```

Then, in your own app, install the generated `rihwwn-meeu-carousel-0.1.0.tgz` file. Cloning the repository installs the complete demo; the archive installs only this component package.

## Use

```tsx
import { CinemaCarousel } from '@rihwwn/meeu-carousel';
import '@rihwwn/meeu-carousel/style.css';

const items = [
  { id: 'one', title: 'First story', image: '/posters/one.jpg', backdrop: '/backdrops/one.jpg' },
  { id: 'two', title: 'Another story', image: '/posters/two.jpg', backdrop: '/backdrops/two.jpg' },
  { id: 'three', title: 'Your next favorite', image: '/posters/three.jpg' },
];

export default function App() {
  return <CinemaCarousel items={items} onSelect={item => console.log(item.id)} />;
}
```

Use `variant="taste"` for the portrait recommendation carousel. The hero uses `backdrop` when supplied; the recommendation carousel uses `image`. Use high-resolution landscape images for the hero and portrait posters for recommendations. The examples reference images you provide in your own app.

## Props

| Prop | Default | Purpose |
| --- | --- | --- |
| `items` | required | Array of items with unique `id`, `title` and `image` strings |
| `variant` | `"hero"` | `"hero"` or `"taste"` |
| `autoplay` | `true` | Enable automatic navigation |
| `paused` | `false` | Pause automatic navigation from your own controls |
| `interval` | `6500` | Automatic navigation interval in milliseconds; minimum 1000 |
| `initialIndex` | `0` | Initial selection, clamped to the collection |
| `eyebrow` | none | Optional hero collection/brand label |
| `className` | none | Add your own class to the component root |
| `onSelect` | none | Receive the clicked active item, including your custom fields |
| `onPositionChange` | none | Receive the selected index, including on mount |
| `onReady` | none | Called when an image loads or fails |

Items can also include `backdrop`, `subtitle`, `rating` and `metadata`. Metadata is an array of `{ label: string, value: string, icon?: ReactNode }` entries. `subtitle` and `rating` appear in the recommendation variant; metadata appears in the hero. Additional item fields are preserved and inferred in `onSelect`.

```tsx
const items = [{
  id: 'my-title', title: 'My title', image: '/poster.jpg',
  subtitle: 'Adventure', rating: '4.8',
  metadata: [{ label: 'Year', value: '2026' }, { label: 'Length', value: '1h 45m' }],
  url: '/titles/my-title',
}];

<CinemaCarousel items={items} onSelect={item => window.location.assign(item.url)} />;
```

Fetch data however your app prefers, including TanStack Query, then pass the resulting array as `items`. No provider is required by this package. An empty collection renders nothing; changing the ordered item IDs or variant resets selection. Changing only artwork keeps selection and waits for the new image to load.

## Styling and behavior

Import `style.css` once. Styles are scoped under `.meeu-carousel`; the component inherits your font and defines no page-wide reset. Override `--meeu-accent` and `--meeu-color` in your own class. Carousel sizing uses its container's width. Place it in a block with a defined available width, and use a dark surrounding background for the default appearance.

Arrow keys, swipe, pointer controls, hover/focus pause and reduced-motion preferences are supported. Autoplay stops outside the viewport and while the page is hidden; reduced motion also disables automatic navigation. Each instance owns its SVG clip path. Rendering to HTML on the server is supported; interactive behavior runs in the browser. Use modern browsers supporting container query units, SVG clip paths and backdrop filters.

## Development

Run commands from the repository root:

```sh
npm run build:carousel
npm test
npm run build
```

`npm run dev` builds the package before starting the demo. After editing package source during development, run `npm run build:carousel` again. Package output is generated under `packages/meeu-carousel/dist/` and is excluded from Git. The demo imports this same workspace package.

MIT applies to the implementation. Supply your own content and images; third-party media from the demo is excluded from this package. See the repository's [asset notes](https://github.com/rihwwn/react-movie-ui/blob/main/CREDITS.md).
