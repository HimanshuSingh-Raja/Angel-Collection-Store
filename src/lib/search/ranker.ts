import { levenshteinDistance } from './trie';

export interface ScoredProduct {
  product: any;
  score: number;
}

export function rankProductSearch(query: string, products: any[]): ScoredProduct[] {
  const q = query.toLowerCase().trim();
  if (!q) {
    return products.map((p) => ({ product: p, score: 0 }));
  }

  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = products.map((product) => {
    let score = 0;
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const categoryName = typeof product.category === 'object' ? (product.category?.name || '') : (product.category || '');
    const subcategoryName = typeof product.subcategory === 'object' ? (product.subcategory?.name || '') : (product.subcategory || '');
    const brandName = typeof product.brand === 'object' ? (product.brand?.name || '') : (product.brand || '');
    const tags = (product.tags || '').toLowerCase();

    // 1. Exact Title Match (+100)
    if (title === q) {
      score += 100;
    } else if (title.includes(q)) {
      score += 80;
    }

    // 2. Prefix Match (+80)
    if (title.startsWith(q)) {
      score += 80;
    }

    // 3. Category & Subcategory Match (+60)
    if (categoryName.toLowerCase().includes(q) || subcategoryName.toLowerCase().includes(q)) {
      score += 60;
    }

    // 4. Brand Match (+50)
    if (brandName.toLowerCase().includes(q)) {
      score += 50;
    }

    // 5. Description Match (+40)
    if (description.includes(q)) {
      score += 40;
    }

    // 6. Tags Match (+30)
    if (tags.includes(q)) {
      score += 30;
    }

    // Token level matching
    tokens.forEach((token) => {
      if (title.includes(token)) score += 25;
      if (categoryName.toLowerCase().includes(token)) score += 20;
      if (tags.includes(token)) score += 15;

      // Fuzzy check for typos (Levenshtein distance <= 2)
      const titleWords = title.split(/\s+/);
      titleWords.forEach((word: string) => {
        if (Math.abs(word.length - token.length) <= 2) {
          const dist = levenshteinDistance(token, word);
          if (dist === 1) score += 15;
          else if (dist === 2) score += 8;
        }
      });
    });

    // 7. Popularity / Best Seller Bonus (+20)
    if (product.isBestSeller || product.isTrending) {
      score += 20;
    }

    // 8. Rating Bonus (+10)
    if (product.rating && Number(product.rating) >= 4.5) {
      score += 10;
    }

    return { product, score };
  });

  // Sort descending by score
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}
