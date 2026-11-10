# React Movie UI

قالب رابط فیلم و سریال با **React، TypeScript، TanStack Query و Vite**؛ مناسب شروع یک وب‌سایت کشف فیلم یا استفاده از کامپوننت‌های آن در پروژهٔ شخصی.

![تصویر کامل بخش اول و اسلایدر فیلم‌های The Odyssey، Spider-Man: Brand New Day و Toy Story 5](docs/images/hero-high-resolution.jpg)

*پیش‌نمایش کامل بخش اول با کامپوننت‌ها و تصاویر فیلم‌های همراه پروژه است. حرکت ورود برای ثبت عکس متوقف و نمایش کوچک‌تر شده تا هدر، متن‌ها، اسلایدر و کنترل‌های پایین آن کامل داخل کادر باشند.*

[English documentation](README.md) · [مجوز فایل‌های همراه](CREDITS.md)

## استفاده فقط از اسلایدر

پکیج مستقل **Meeu Carousel** در مسیر [`packages/meeu-carousel`](packages/meeu-carousel) همین مخزن قرار دارد و خود دمو هم از آن استفاده می‌کند. برای نصب در پروژهٔ React خودتان:

```sh
npm install https://github.com/rihwwn/react-movie-ui/releases/download/meeu-carousel-v0.1.0/rihwwn-meeu-carousel-0.1.0.tgz
```

```tsx
import { CinemaCarousel } from '@rihwwn/meeu-carousel';
import '@rihwwn/meeu-carousel/style.css';

<CinemaCarousel items={[
  { id: 'one', title: 'فیلم اول', image: '/poster.jpg', backdrop: '/wide.jpg' },
  { id: 'two', title: 'فیلم دوم', image: '/another-poster.jpg' },
]} onSelect={item => console.log(item.id)} />;
```

تصاویر را در پروژهٔ خودتان قرار دهید. برای مدل پوسترهای منحنی، `variant="taste"` را اضافه کنید. این پکیج به React وابسته است و برند، تصاویر فیلم‌ها، فونت و React Query را همراه خودش نصب نمی‌کند. خروجی‌های بسته‌بندی‌شده در Releases همین مخزن هستند؛ پکیج هنوز در رجیستری npm منتشر نشده است.

برای ساخت فایل نصب از سورس، در ریشهٔ همین مخزن `npm ci` و سپس `npm run pack:carousel` را اجرا کنید؛ فایل `.tgz` ساخته‌شده را در پروژهٔ مقصد نصب کنید. [راهنمای کامل پکیج](packages/meeu-carousel)

## اجرا

Node.js نسخهٔ ۲۰ یا جدیدتر لازم است؛ پیشنهاد می‌شود از یک نسخهٔ LTS پشتیبانی‌شده استفاده کنید.

```sh
git clone https://github.com/rihwwn/react-movie-ui.git
cd react-movie-ui
npm ci
npm run dev
```

آدرس: **http://localhost:4173**. دمو به API key یا backend نیاز ندارد.

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

خروجی در `dist/` ساخته می‌شود. سرور توسعه و preview پورت یکسان دارند؛ قبل از اجرای دیگری، سرور قبلی را متوقف کنید.

## امکانات

- اسلایدر با تغییر عرض، حرکت جهت‌دار، ورود مرحله‌ای متن، پخش خودکار، swipe و کیبورد.
- اسلایدر پیشنهادها با کارت میانی روشن و کارت‌های کناری سایه‌دار.
- حرکت ردیف‌ها در جهت مخالف، بدون تکثیر کارت در مجموعه‌های کوتاه.
- ورود هنگام اسکرول، دکمهٔ مکث و رعایت تنظیم کاهش حرکت سیستم.
- جست‌وجو، دسته‌بندی و فهرست تماشای محلی.
- صفحهٔ اختصاصی فیلم و سریال، عوامل، داستان، اطلاعات فنی و پیشنهادهای مرتبط.
- انتخاب فصل، فهرست قسمت‌ها و پلیر نمونه.
- لینک مستقیم، رفرش و Back/Forward مرورگر.
- دریافت داده و کش با React Query، اعتبارسنجی پاسخ و مدیریت بارگذاری و خطا.

## شخصی‌سازی

| فایل | کاربرد |
| --- | --- |
| `src/content.ts` | نام، متن‌ها و شناسهٔ فیلم‌های بخش‌های اصلی |
| `public/catalog.json` | کاتالوگ، دسته‌ها و مسیر تصاویر |
| `src/titleDetails.ts` | عوامل و اطلاعات نمایشی فصل‌ها |
| `src/styles.css` | ظاهر، واکنش‌گرایی و انیمیشن‌ها |
| `packages/meeu-carousel/src/` | رفتار اسلایدرها، تایپ‌ها و CSS مستقل پکیج |
| `src/components/Carousel.tsx` | تبدیل داده و متن‌های دمو برای پکیج |
| `src/catalog.ts` | مدل داده، endpoint و اعتبارسنجی API |
| `src/components/TitlePage.tsx` | جزئیات عنوان، قسمت‌ها و پلیر |

با تغییر کاتالوگ، شناسه‌های `content.ts` و `titleDetails.ts` را هماهنگ کنید. این انتشار یک پروژهٔ آمادهٔ Vite است؛ کامپوننت‌ها همراه با استایل‌هایشان قابل انتقال به پروژهٔ React دیگرند.

## اتصال API و انتشار

دمو `catalog.json` را از مسیر نصب پروژه می‌خواند. برای API واقعی، endpoint و اعتبارسنجی `src/catalog.ts` را با قرارداد سرور تطبیق دهید. اعتبارسنج فعلی فقط مسیرهای محلی `assets/` با نام انگلیسی کوچک و خط تیره و پسوند SVG، JPG، PNG یا WebP را می‌پذیرد؛ تصاویر ریموت به تنظیم قرارداد و مبدأهای مجاز نیاز دارند. مدل کامل در [راهنمای انگلیسی](README.md#connect-your-api) است.

برای پخش واقعی، لینک مجاز ویدیو را در پلیر جایگزین کنید. کلید محرمانهٔ سرویس‌ها باید روی backend بماند. backend مشترک می‌تواند بعداً وب و Flutter را تغذیه کند؛ کامپوننت React خودکار به Flutter تبدیل نمی‌شود.

خروجی `dist/` را می‌توانید در ریشهٔ سایت یا زیرپوشه منتشر کنید؛ مسیر زیرپوشه باید با `/` تمام شود. آدرس فایل‌ها نسبی است و کاتالوگ، تصاویر، ویدیو و لینک‌ها داخل همان مسیر می‌مانند. آدرس عنوان‌ها مانند `/react-movie-ui/?title=dragons` است و به rewrite مسیرهای SPA نیاز ندارد.

### انتشار روی Cloudflare Workers از GitHub

فایل `wrangler.jsonc` و Worker کوچک تایپ‌اسکریپت در `src/worker.ts` پوشهٔ `dist/` را از طریق binding استاندارد `ASSETS` در مسیر **`/react-movie-ui/`** سرو می‌کنند. Worker پیشوند مسیر را هنگام خواندن فایل‌ها حذف می‌کند و هدایت‌ها را داخل مسیر پروژه نگه می‌دارد. این روش به قابلیت حساب‌محور `assets.base_path` نیاز ندارد. انتشار در ریشهٔ سایت و آدرس فعال `workers.dev` هم کار می‌کند. شناسهٔ حساب یا توکن در مخزن قرار نمی‌گیرد.

در داشبورد Cloudflare وارد **Workers & Pages** شوید، مخزن GitHub را import کنید و تنظیمات زیر را بگذارید:

| تنظیم | مقدار |
| --- | --- |
| مخزن | `rihwwn/react-movie-ui` یا نسخهٔ کپی خودتان |
| شاخهٔ اصلی | `main` |
| نام Worker | `react-movie-ui` |
| Root directory | ریشهٔ مخزن؛ خالی یا `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4.158.0 deploy` |
| نسخهٔ Node.js | `24`؛ از فایل `.node-version` داخل مخزن خوانده می‌شود |

Cloudflare فایل `.node-version` را از ریشهٔ مخزن می‌خواند؛ لازم نیست متغیر محیطی برای نسخهٔ Node اضافه کنید. [راهنمای محیط Build در Cloudflare](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)

نام Worker باید با فیلد `name` در `wrangler.jsonc` یکی باشد؛ اگر نام دیگری انتخاب کردید، هر دو را تغییر دهید. Cloudflare وابستگی‌ها را از lockfile نصب می‌کند و بعد از اتصال، pushهای شاخهٔ `main` را خودکار build و منتشر می‌کند. اگر `workers.dev` فعال باشد، `/react-movie-ui/` را به انتهای آدرس Worker اضافه کنید.

برای انتشار خودکار، برنامهٔ GitHub با نام **Cloudflare Workers and Pages** باید به همین مخزن دسترسی داشته باشد. اگر داشبورد پیام قطع اتصال به حساب Git را نشان داد، از **Settings > Builds > Git repository > Manage** مخزن را به انتخاب‌های فعلی برنامه اضافه و ذخیره کنید. در حالت انتخاب تک‌تک مخزن‌ها، مخزن جدید خودکار به فهرست اضافه نمی‌شود.

برای مسیر روی دامنهٔ موجود در Cloudflare، وارد **Domains > Add > Route** شوید، Zone دامنه را انتخاب کنید و فقط الگوی پروژه را اضافه کنید؛ مثلاً `example.com/react-movie-ui*`. آدرس سایت `https://example.com/react-movie-ui/` می‌شود و Worker پیشوند مسیر را مدیریت می‌کند. اتصال دامنهٔ صفحهٔ اصلی را تغییر ندهید. برای تغییر مسیر دمو، مقدار `prefix` در `src/worker.ts` و الگوی Route را با هم تغییر دهید. این مسیریابی کد Worker را برای درخواست‌ها اجرا می‌کند و محدودیت‌های معمول درخواست‌های Workers اعمال می‌شود. [راهنمای binding فایل‌ها](https://developers.cloudflare.com/workers/static-assets/binding/) و [Route](https://developers.cloudflare.com/workers/configuration/routing/routes/)

برای انتشار دستی با Node.js نسخهٔ ۲۲ یا جدیدتر:

```sh
npm run build
npx wrangler@4.158.0 login
npx wrangler@4.158.0 deploy
```

برای روش داشبورد، ورود محلی با Wrangler لازم نیست. تنظیم SPA fallback هم برای لینک‌های فعلی که با query کار می‌کنند لازم نیست. [راهنمای رسمی تنظیمات Build](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)

## محدودهٔ دمو

کاتالوگ ۲۳ عنوان دارد و دستی نگهداری می‌شود. امتیازها، تعداد فصل‌ها، قسمت‌ها و مدت قسمت‌ها نمایشی‌اند و دادهٔ IMDb یا TMDB نیستند. پوسترهای کوچک با نسخه‌های منتشرشدهٔ بزرگ‌تر جایگزین شده‌اند؛ [منبع و وضوح تصاویر](CATALOG-SOURCES.md#refreshed-poster-sources) ثبت شده است. همهٔ عنوان‌ها یک کلیپ نمونهٔ CC0 را پخش می‌کنند؛ داشتن تصویر فیلم به معنی دسترسی به خود فیلم نیست.

فهرست تماشا با کلید `react-movie-ui-watchlist` در همین مرورگر ذخیره می‌شود. حساب کاربری، اشتراک، backend استریم و اپ Flutter یا تلویزیون در این قالب وجود ندارد.

## مجوز

[مجوز MIT](LICENSE) برای پیاده‌سازی و favicon پروژه است؛ تصاویر و علائم تجاری فیلم‌ها متعلق به صاحبان خود هستند و تحت این مجوز قرار نمی‌گیرند. مجوز فونت و ویدیوی نمونه در [CREDITS.md](CREDITS.md) توضیح داده شده است.
