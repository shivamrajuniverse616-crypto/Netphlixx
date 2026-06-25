export function getMediaType(item) {
  if (item?.media_type) return item.media_type;
  if (item?.title) return 'movie';
  if (item?.name) return 'tv';
  return 'movie';
}
