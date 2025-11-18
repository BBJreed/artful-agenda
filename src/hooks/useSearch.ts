import { useState, useEffect, useCallback, useMemo } from 'react';

interface SearchOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  enableFuzzySearch?: boolean;
  minScore?: number; // Minimum score for fuzzy search (0-1)
  caseSensitive?: boolean;
  enableHighlighting?: boolean;
  debounceMs?: number;
}

interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string>;
}

export const useSearch = <T extends Record<string, any>>(
  options: SearchOptions<T>
) => {
  const {
    data,
    searchFields,
    enableFuzzySearch = false,
    minScore = 0.3,
    caseSensitive = false,
    enableHighlighting = false,
    debounceMs = 300
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs]);

  // Fuzzy search algorithm (simplified version of Levenshtein distance)
  const fuzzySearch = useCallback((text: string, pattern: string): number => {
    if (!text || !pattern) return 0;
    
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
    
    // Simple ratio calculation
    let matches = 0;
    let patternIndex = 0;
    
    for (let i = 0; i < searchText.length; i++) {
      if (patternIndex < searchPattern.length && searchText[i] === searchPattern[patternIndex]) {
        matches++;
        patternIndex++;
      }
    }
    
    return matches / searchPattern.length;
  }, [caseSensitive]);

  // Highlight search terms in text
  const highlightText = useCallback((text: string, term: string): string => {
    if (!term) return text;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, flags);
    
    return text.replace(regex, '<mark>$1</mark>');
  }, [caseSensitive]);

  // Perform search
  const searchResults = useMemo((): SearchResult<T>[] => {
    if (!debouncedQuery) return data.map(item => ({ item, score: 1 }));
    
    setIsSearching(true);
    
    try {
      const results: SearchResult<T>[] = [];
      const fields = searchFields || (Object.keys(data[0] || {}) as (keyof T)[]);
      
      data.forEach(item => {
        let maxScore = 0;
        const highlights: Record<string, string> = {};
        
        fields.forEach(field => {
          const fieldValue = item[field];
          if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') return;
          
          const text = String(fieldValue);
          let score = 0;
          
          if (enableFuzzySearch) {
            score = fuzzySearch(text, debouncedQuery);
          } else {
            const searchText = caseSensitive ? text : text.toLowerCase();
            const searchQuery = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();
            score = searchText.includes(searchQuery) ? 1 : 0;
          }
          
          if (score > maxScore) {
            maxScore = score;
          }
          
          if (enableHighlighting && score > 0) {
            highlights[field as string] = highlightText(text, debouncedQuery);
          }
        });
        
        if (maxScore >= minScore) {
          results.push({
            item,
            score: maxScore,
            highlights: Object.keys(highlights).length > 0 ? highlights : undefined
          });
        }
      });
      
      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score);
      
      return results;
    } finally {
      setIsSearching(false);
    }
  }, [data, searchFields, debouncedQuery, enableFuzzySearch, minScore, caseSensitive, enableHighlighting, fuzzySearch, highlightText]);

  // Filter results by score
  const filteredResults = useMemo(() => {
    return searchResults.filter(result => result.score >= minScore);
  }, [searchResults, minScore]);

  // Get search statistics
  const getSearchStats = useCallback(() => {
    return {
      totalResults: filteredResults.length,
      maxScore: filteredResults.length > 0 ? filteredResults[0].score : 0,
      minScore: filteredResults.length > 0 ? filteredResults[filteredResults.length - 1].score : 0,
      averageScore: filteredResults.length > 0 
        ? filteredResults.reduce((sum, result) => sum + result.score, 0) / filteredResults.length 
        : 0
    };
  }, [filteredResults]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  // Search by specific field
  const searchByField = useCallback((field: keyof T, value: string) => {
    const results: SearchResult<T>[] = [];
    
    data.forEach(item => {
      const fieldValue = item[field];
      if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') return;
      
      const text = String(fieldValue);
      let score = 0;
      
      if (enableFuzzySearch) {
        score = fuzzySearch(text, value);
      } else {
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchValue = caseSensitive ? value : value.toLowerCase();
        score = searchText.includes(searchValue) ? 1 : 0;
      }
      
      if (score >= minScore) {
        const highlights: Record<string, string> = {};
        if (enableHighlighting && score > 0) {
          highlights[field as string] = highlightText(text, value);
        }
        
        results.push({
          item,
          score,
          highlights: Object.keys(highlights).length > 0 ? highlights : undefined
        });
      }
    });
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return results;
  }, [data, enableFuzzySearch, minScore, caseSensitive, enableHighlighting, fuzzySearch, highlightText]);

  return {
    query,
    setQuery,
    results: filteredResults,
    isSearching,
    getSearchStats,
    clearSearch,
    searchByField
  };
};

export default useSearch;