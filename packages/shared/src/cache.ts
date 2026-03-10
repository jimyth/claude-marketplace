import * as fs from 'fs';
import * as path from 'path';
import { CacheData, InstalledExtension } from '../types';

const DEFAULT_CACHE: CacheData = { installed: [] };

export class CacheManager {
  private cachePath: string;
  private data: CacheData;

  constructor(cacheDir: string) {
    this.cachePath = path.join(cacheDir, 'cache.json');
    this.data = this.load();
  }

  private load(): CacheData {
    try {
      if (fs.existsSync(this.cachePath)) {
        const content = fs.readFileSync(this.cachePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to load cache, using default:', error);
    }
    return { ...DEFAULT_CACHE };
  }

  private save(): void {
    const dir = path.dirname(this.cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.cachePath, JSON.stringify(this.data, null, 2));
  }

  /**
   * Get all installed extensions
   */
  getInstalled(): InstalledExtension[] {
    return [...this.data.installed];
  }

  /**
   * Add or update installed extension
   */
  addInstalled(extension: InstalledExtension): void {
    const index = this.data.installed.findIndex(e => e.id === extension.id);
    if (index >= 0) {
      this.data.installed[index] = extension;
    } else {
      this.data.installed.push(extension);
    }
    this.save();
  }

  /**
   * Remove installed extension
   */
  removeInstalled(id: string): boolean {
    const index = this.data.installed.findIndex(e => e.id === id);
    if (index >= 0) {
      this.data.installed.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Get installed extension by ID
   */
  getInstalledById(id: string): InstalledExtension | undefined {
    return this.data.installed.find(e => e.id === id);
  }

  /**
   * Update last index update timestamp
   */
  setLastIndexUpdate(): void {
    this.data.lastIndexUpdate = new Date().toISOString();
    this.save();
  }

  /**
   * Check if index cache is stale (older than 24 hours)
   */
  isIndexCacheStale(): boolean {
    if (!this.data.lastIndexUpdate) return true;
    const lastUpdate = new Date(this.data.lastIndexUpdate).getTime();
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - lastUpdate) > hours24;
  }
}
