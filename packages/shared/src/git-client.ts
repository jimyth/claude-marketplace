import { IndexEntry } from '../types';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';

export interface GitClientOptions {
  owner: string;
  repo: string;
  branch?: string;
}

/**
 * Git repository client for fetching files
 */
export class GitClient {
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(options: GitClientOptions) {
    this.owner = options.owner;
    this.repo = options.repo;
    this.branch = options.branch || 'main';
  }

  /**
   * Get raw file URL
   */
  getRawUrl(path: string): string {
    return `${GITHUB_RAW_URL}/${this.owner}/${this.repo}/${this.branch}/${path}`;
  }

  /**
   * Fetch a single file
   */
  async fetchFile(path: string): Promise<string> {
    const url = this.getRawUrl(path);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Fetch index.yaml
   */
  async fetchIndex(): Promise<string> {
    return this.fetchFile('index.yaml');
  }

  /**
   * Fetch all files for an extension
   */
  async fetchExtension(entry: IndexEntry): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    for (const file of entry.files) {
      const fullPath = `${entry.path}/${file}`;
      const content = await this.fetchFile(fullPath);
      files.set(file, content);
    }

    return files;
  }
}
