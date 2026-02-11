// Assets required to render loading + main screen immediately
export const CRITICAL_ASSETS = [
  '/back-texture.png',
  '/heart.png',
  '/heart-small.png',
  '/close_env.png',
  '/env_open_bot.png',
  '/env_open_top.png',
];

// Non-blocking assets used later in collage/letter screens
export const NON_CRITICAL_STATIC_ASSETS = [
  '/heart_paper.png',
  '/heart_shape_pic.png',
  '/cherry.png',
  '/envelop_close_1.png',
  '/envelop_close_2.png',
  '/envelope-closed.png',
  '/envelope-flap.png',
  '/envelope-front.png',
  '/wax-seal.png',
  '/khung_1.png',
  '/khung_2.png',
  '/stamp.png',
  '/star_icon.png',
  '/flower_stiker.png',
  '/clam_sticker.png',
  '/sign_sticker.png',
];

// Keep icon list explicit to avoid requesting non-existing files (11, 12, 13, 15...)
export const EXISTING_ICON_ASSETS = [
  '/icon01.png',
  '/icon02.png',
  '/icon03.png',
  '/icon04.png',
  '/icon05.png',
  '/icon16.png',
];

export const STATIC_ASSETS = [...CRITICAL_ASSETS, ...NON_CRITICAL_STATIC_ASSETS];

const DEFAULT_PER_IMAGE_TIMEOUT = 2500;
const DEFAULT_GLOBAL_TIMEOUT = 5000;
const CRITICAL_PER_IMAGE_TIMEOUT = 1200;
const CRITICAL_GLOBAL_TIMEOUT = 2200;

interface PreloadOptions {
  perImageTimeout?: number;
  globalTimeout?: number;
}

/**
 * Preload a single image with a timeout
 */
export function preloadImage(src: string, timeout = DEFAULT_PER_IMAGE_TIMEOUT): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => {
      console.warn(`Preload timed out: ${src}`);
      resolve();
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(timer);
      console.warn(`Failed to preload image: ${src}`);
      resolve(); // Don't reject, just continue
    };
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel with a global timeout
 */
export async function preloadImages(sources: string[], options: PreloadOptions = {}): Promise<void> {
  const perImageTimeout = options.perImageTimeout ?? DEFAULT_PER_IMAGE_TIMEOUT;
  const globalTimeout = options.globalTimeout ?? DEFAULT_GLOBAL_TIMEOUT;
  const uniqueSources = [...new Set(sources.filter(Boolean))];

  if (uniqueSources.length === 0) return;

  await Promise.race([
    Promise.all(uniqueSources.map((src) => preloadImage(src, perImageTimeout))),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('Global preload timeout reached, proceeding anyway');
        resolve();
      }, globalTimeout);
    }),
  ]);
}

/**
 * Block until critical assets are ready
 */
export async function preloadStaticAssets(): Promise<void> {
  await preloadCriticalAssets();
}

/**
 * Blocking preload for only first-screen assets
 */
export async function preloadCriticalAssets(): Promise<void> {
  await preloadImages(CRITICAL_ASSETS, {
    perImageTimeout: CRITICAL_PER_IMAGE_TIMEOUT,
    globalTimeout: CRITICAL_GLOBAL_TIMEOUT,
  });
}

/**
 * Fire-and-forget preload for static assets that are not needed immediately
 */
export function preloadSecondaryStaticAssetsInBackground(): void {
  window.setTimeout(() => {
    void preloadImages(NON_CRITICAL_STATIC_ASSETS);
  }, 0);
}

/**
 * Fire-and-forget preload for optional icons (only existing files)
 */
export function preloadExistingIconsInBackground(): void {
  window.setTimeout(() => {
    void preloadImages(EXISTING_ICON_ASSETS);
  }, 0);
}

/**
 * Fire-and-forget preload for static + dynamic assets (e.g., card images)
 */
export function preloadRemainingAssetsInBackground(dynamicImages: string[] = []): void {
  const allImages = [...NON_CRITICAL_STATIC_ASSETS, ...dynamicImages.filter(Boolean)];
  window.setTimeout(() => {
    void preloadImages(allImages);
  }, 0);
}

/**
 * Legacy API: previously blocked on all assets, now only blocks critical assets
 * and moves remaining assets to background to improve perceived loading speed.
 */
export async function preloadAllAssets(dynamicImages: string[] = []): Promise<void> {
  await preloadCriticalAssets();
  preloadRemainingAssetsInBackground(dynamicImages);
}
