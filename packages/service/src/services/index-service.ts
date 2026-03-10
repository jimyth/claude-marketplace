import { GitClient, IndexEntry, MarketIndex } from '@claude-marketplace/shared';

interface SourceConfig {
  name: string;
  owner: string;
  repo: string;
  branch?: string;
  priority: number;
}

const DEFAULT_SOURCES: SourceConfig[] = [
  {
    name: 'public',
    owner: 'jimyth',
    repo: 'claude-skill-market',
    branch: 'main',
    priority: 10,
  },
];

export class IndexService {
  private sources: SourceConfig[];
  private cache: Map<string, MarketIndex> = new Map();
  private cacheTime: Map<string, number> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor(sources?: SourceConfig[]) {
    this.sources = sources || DEFAULT_SOURCES;
  }

  /**
   * Search extensions across all sources
   */
  async search(query: string, scope: string = 'all'): Promise<IndexEntry[]> {
    const results: Array<{ entry: IndexEntry; priority: number; source: string }> = [];

    for (const source of this.sources) {
      if (scope !== 'all' && scope !== source.name) continue;

      const index = await this.getIndex(source);
      if (!index) continue;

      const matches = index.skills.filter(skill =>
        this.matchesQuery(skill, query)
      );

      for (const entry of matches) {
        results.push({
          entry,
          priority: source.priority,
          source: source.name,
        });
      }
    }

    // Sort by priority (higher first)
    results.sort((a, b) => b.priority - a.priority);

    return results.map(r => ({
      ...r.entry,
      source: r.source,
    } as IndexEntry));
  }

  /**
   * Get extension by ID
   */
  async getExtension(id: string): Promise<IndexEntry | null> {
    for (const source of this.sources) {
      const index = await this.getIndex(source);
      if (!index) continue;

      const found = index.skills.find(s => s.id === id);
      if (found) {
        return { ...found, source: source.name } as IndexEntry;
      }
    }

    return null;
  }

  /**
   * Get index for a source (with caching)
   */
  private async getIndex(source: SourceConfig): Promise<MarketIndex | null> {
    const cacheKey = source.name;
    const now = Date.now();

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cachedTime = this.cacheTime.get(cacheKey) || 0;
      if (now - cachedTime < this.CACHE_TTL) {
        return this.cache.get(cacheKey) || null;
      }
    }

    // Fetch fresh index
    try {
      const client = new GitClient({
        owner: source.owner,
        repo: source.repo,
        branch: source.branch,
      });

      const yamlContent = await client.fetchIndex();
      const { parseIndexYaml } = await import('@claude-marketplace/shared');
      const index = parseIndexYaml(yamlContent);

      this.cache.set(cacheKey, index);
      this.cacheTime.set(cacheKey, now);

      return index;
    } catch (error) {
      console.error(`Failed to fetch index for ${source.name}:`, error);
      return this.cache.get(cacheKey) || null;
    }
  }

  /**
   * Check if entry matches query
   */
  private matchesQuery(entry: IndexEntry, query: string): boolean {
    if (!query) return true;

    const q = query.toLowerCase();
    const searchText = [
      entry.name,
      entry.description,
      entry.author,
      ...(entry.tags || []),
    ].join(' ').toLowerCase();

    // Support multiple keywords (space-separated)
    const keywords = q.split(/\s+/);
    return keywords.some(kw => searchText.includes(kw));
  }
}
