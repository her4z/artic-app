import { api } from './httpClient';
import { ArtworkResponse, Artwork } from '../types/artwork';

// API Configuration
const ARTWORK_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
  fields:
    'id,title,artist_title,description,image_id,date_display,medium_display,style_title,classification_title',
} as const;

// Parameter validation
const validateParams = (page: number, limit: number, searchQuery?: string) => {
  if (page < 1) throw new Error('Page must be greater than 0');
  if (limit < 1 || limit > ARTWORK_CONFIG.maxLimit) {
    throw new Error(`Limit must be between 1 and ${ARTWORK_CONFIG.maxLimit}`);
  }
  if (searchQuery && typeof searchQuery !== 'string') {
    throw new Error('Search query must be a string');
  }
};

/**
 * Fetch artworks from the Art Institute of Chicago API
 * @param page - Page number (default: 1)
 * @param limit - Number of artworks per page (default: 20, max: 100)
 * @param searchQuery - Optional search term
 * @returns Promise<ArtworkResponse>
 */
export const getArtworks = async (
  page: number = ARTWORK_CONFIG.defaultPage,
  limit: number = ARTWORK_CONFIG.defaultLimit,
  searchQuery?: string,
): Promise<ArtworkResponse> => {
  try {
    // Validate parameters
    validateParams(page, limit, searchQuery);

    const params: Record<string, any> = {
      page,
      limit,
      fields: ARTWORK_CONFIG.fields,
    };

    // Add search query if provided
    if (searchQuery?.trim()) {
      params.q = searchQuery.trim();
    }

    const response = await api.get('/artworks/search', { params });
    return response.data;
  } catch (error) {
    console.error('[Artworks API Error]', error);
    throw new Error(
      `Failed to fetch artworks: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Search artworks with advanced filtering
 * @param searchQuery - Search term
 * @param page - Page number
 * @param limit - Number of results per page
 * @param artist - Filter by artist
 * @param classification - Filter by classification
 * @returns Promise<ArtworkResponse>
 */
export const searchArtworks = async (
  searchQuery: string,
  page: number = ARTWORK_CONFIG.defaultPage,
  limit: number = ARTWORK_CONFIG.defaultLimit,
  artist?: string,
  classification?: string,
): Promise<ArtworkResponse> => {
  try {
    if (!searchQuery?.trim()) {
      throw new Error('Search query is required');
    }

    validateParams(page, limit, searchQuery);

    const params: Record<string, any> = {
      page,
      limit,
      fields: ARTWORK_CONFIG.fields,
      q: searchQuery.trim(),
    };

    // Add filters if provided
    if (artist?.trim()) {
      params.artist_title = artist.trim();
    }

    if (classification?.trim()) {
      params.classification_title = classification.trim();
    }

    const response = await api.get('/artworks/search', { params });
    return response.data;
  } catch (error) {
    console.error('[Artworks Search API Error]', error);
    throw new Error(
      `Failed to search artworks: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
