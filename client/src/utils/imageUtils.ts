/**
 * Utility functions for handling image URLs in the application
 */

/**
 * Formats a relative image path into an absolute URL using the API base URL
 * 
 * @param imagePath - The image path which may be relative or absolute
 * @param defaultImage - Optional default image to return if imagePath is null/undefined
 * @returns Properly formatted absolute URL for the image
 */
export const formatImageUrl = (
  imagePath: string | null | undefined, 
  defaultImage?: string
): string => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // If no image path is provided, return the default image if one is specified
  if (!imagePath) {
    return defaultImage || '';
  }
  
  // If the image is already an absolute URL or data URL, return it as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Otherwise, it's a relative path that needs the API base URL prepended
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Creates a data URL for a placeholder image with the provided initial
 * 
 * @param initial - Initial letter to display in the placeholder
 * @returns Data URL for SVG placeholder image
 */
export const createInitialPlaceholder = (initial: string = 'U'): string => {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" font-size="50" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af">${initial.toUpperCase()}</text></svg>`;
}; 