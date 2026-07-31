export function detectCategoryFromQuery(q: string): { categorySlug?: string; subcategorySlug?: string; displayName?: string } {
  const query = q.toLowerCase().trim();

  if (query.includes('saree')) {
    return { categorySlug: 'women', subcategorySlug: 'sarees', displayName: 'Sarees' };
  }
  if (query.includes('lehenga')) {
    return { categorySlug: 'women', subcategorySlug: 'lehengas', displayName: 'Lehengas' };
  }
  if (query.includes('kurti')) {
    return { categorySlug: 'women', subcategorySlug: 'kurtis', displayName: 'Kurtis' };
  }
  if (query.includes('gown') || query.includes('dress')) {
    return { categorySlug: 'women', subcategorySlug: 'gowns', displayName: 'Gowns & Dresses' };
  }
  if (query.includes('sherwani')) {
    return { categorySlug: 'men', subcategorySlug: 'sherwanis', displayName: 'Sherwanis' };
  }
  if (query.includes('suit') || query.includes('tuxedo') || query.includes('blazer')) {
    return { categorySlug: 'men', subcategorySlug: 'suits', displayName: 'Suits & Tuxedos' };
  }
  if (query.includes('shirt') || query.includes('t-shirt') || query.includes('polo')) {
    return { categorySlug: 'men', subcategorySlug: 'shirts', displayName: 'Shirts & Polos' };
  }
  if (query.includes('watch')) {
    return { categorySlug: 'accessories', subcategorySlug: 'watches', displayName: 'Watches' };
  }
  if (query.includes('bag') || query.includes('tote') || query.includes('clutch')) {
    return { categorySlug: 'accessories', subcategorySlug: 'bags', displayName: 'Bags & Handbags' };
  }
  if (query.includes('jewel') || query.includes('ring') || query.includes('necklace')) {
    return { categorySlug: 'accessories', subcategorySlug: 'jewellery', displayName: 'Fine Jewellery' };
  }

  return {};
}
