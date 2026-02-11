/**
 * Compress an image file to stay under the Vercel body size limit (4.5MB).
 * Uses canvas to resize and re-encode the image as JPEG.
 */
export async function compressImage(
    file: File,
    maxSizeMB: number = 3,
    maxWidthOrHeight: number = 1920,
    quality: number = 0.8
): Promise<File> {
    // If the file is already small enough, return it as-is
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // Scale down if larger than max dimensions
            if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
                if (width > height) {
                    height = Math.round((height * maxWidthOrHeight) / width);
                    width = maxWidthOrHeight;
                } else {
                    width = Math.round((width * maxWidthOrHeight) / height);
                    height = maxWidthOrHeight;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Try progressively lower quality until under the size limit
            let currentQuality = quality;
            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to compress image"));
                            return;
                        }

                        if (blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.3) {
                            currentQuality -= 0.1;
                            tryCompress();
                            return;
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    currentQuality
                );
            };

            tryCompress();
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image for compression"));
        };

        img.src = url;
    });
}
