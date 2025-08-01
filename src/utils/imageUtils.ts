export const getArtworkImageUrl = (
  imageId?: string,
  size: string = 'full/843,/0/default.jpg',
): string => {
  if (!imageId) {
    return 'https://via.placeholder.com/400x600/cccccc/666666?text=No+Image+Available';
  }

  return `https://www.artic.edu/iiif/2/${imageId}/${size}`;
};
