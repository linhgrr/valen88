// List of all static assets used in the app
export const STATIC_ASSETS = [
  '/heart.png',
  '/heart-small.png',
  '/heart_paper.png',
  '/heart_shape_pic.png',
  '/back-texture.png',
  '/cherry.png',
  '/close_env.png',
  '/env_open_bot.png',
  '/env_open_top.png',
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
  '/icon01.png',
  '/icon02.png',
  '/icon03.png',
  '/icon04.png',
  '/icon05.png',
  '/icon16.png',
];

const PER_IMAGE_TIMEOUT = 5000; // 5 seconds per image
const GLOBAL_TIMEOUT = 10000; // 10 seconds max for all preloading

/**
 * Preload a single image with a timeout
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => {
      console.warn(`Preload timed out: ${src}`);
      resolve();
    }, PER_IMAGE_TIMEOUT);

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
export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.race([
    Promise.all(sources.map(preloadImage)),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('Global preload timeout reached, proceeding anyway');
        resolve();
      }, GLOBAL_TIMEOUT);
    }),
  ]);
}

/**
 * Preload all static assets
 */
export async function preloadStaticAssets(): Promise<void> {
  await preloadImages(STATIC_ASSETS);
}

/**
 * Preload static assets + dynamic images (e.g., from API)
 */
export async function preloadAllAssets(dynamicImages: string[] = []): Promise<void> {
  const allImages = [...STATIC_ASSETS, ...dynamicImages.filter(Boolean)];
  await preloadImages(allImages);
}
