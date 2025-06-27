import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isBinary = (path: string) => {
    const binaryExtensions = [
        // Images
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp',
        // Fonts
        '.eot', '.ttf', '.woff', '.woff2', '.otf',
        // Audio/Video
        '.mp3', '.wav', '.mp4', '.webm', '.mov',
        // Archives/Binary
        '.zip', '.gz', '.rar', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        // Common config/lock files
        '.DS_Store', 'package-lock.json', 'yarn.lock'
    ];
    return binaryExtensions.some(ext => path.toLowerCase().endsWith(ext));
};
