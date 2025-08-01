/**
 * Artwork interface representing a piece from the Art Institute of Chicago
 */
export interface Artwork {
  id: number;
  title: string;
  artist_title: string;
  description: string;
  image_id?: string;
  classification_title: string;
}

export interface ArtworkResponse {
  data: Artwork[];
  pagination: {
    current_page: number;
    total_pages: number;
  };
  config: {
    iiif_url: string;
  };
}
