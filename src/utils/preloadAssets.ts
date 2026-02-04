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
  '/icon01.png',
  '/icon02.png',
  '/icon03.png',
  '/icon04.png',
  '/icon05.png',
  '/icon11.png',
  '/icon12.png',
  '/icon13.png',
  '/icon15.png',
  '/icon16.png',
];

/**
 * Preload a single image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn(`Failed to preload image: ${src}`);
      resolve(); // Don't reject, just continue
    };
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel
 */
export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.all(sources.map(preloadImage));
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
  const allImages = [...STATIC_ASSETS, ...dynamicImages];
  await preloadImages(allImages);
}
