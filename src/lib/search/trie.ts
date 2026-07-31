// Trie Data Structure for Superfast Prefix Autocomplete & Inverted Index Search

export class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  words: Set<string>;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.words = new Set();
  }
}

export class SearchTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string) {
    const normalized = word.toLowerCase().trim();
    if (!normalized) return;

    let current = this.root;
    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
      current.words.add(normalized);
    }
    current.isEndOfWord = true;
  }

  searchPrefix(prefix: string, maxResults = 8): string[] {
    const normalized = prefix.toLowerCase().trim();
    if (!normalized) return [];

    let current = this.root;
    for (const char of normalized) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }
    return Array.from(current.words).slice(0, maxResults);
  }
}

// Levenshtein Distance for Fuzzy Matching & Typo Tolerance
export function levenshteinDistance(a: string, b: string): number {
  const str1 = a.toLowerCase();
  const str2 = b.toLowerCase();
  const matrix: number[][] = [];

  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[str1.length][str2.length];
}
