import { IndexEntry, GitClient } from '@claude-marketplace/shared';

export class DownloadService {
  /**
   * Fetch all files for an extension
   */
  async fetchExtensionFiles(entry: IndexEntry): Promise<Map<string, string>> {
    // Parse source from entry
    const source = (entry as any).source || 'public';

    // Get Git client for the source
    const client = this.getClientForSource(source);

    if (!client) {
      throw new Error(`Unknown source: ${source}`);
    }

    return client.fetchExtension(entry);
  }

  /**
   * Publish extension to user's repository
   */
  async publishExtension(apiKey: string, data: {
    id: string;
    files: Record<string, string>;
    manifest: any;
  }): Promise<{ version: string; message: string }> {
    // TODO: Implement actual publish logic
    // 1. Get user's personal repo from API key
    // 2. Use stored Git token to push files
    // 3. Update index

    console.log('Publishing extension:', data.id);

    return {
      version: data.manifest?.version || '1.0.0',
      message: 'Extension published successfully',
    };
  }

  /**
   * Get Git client for a source
   */
  private getClientForSource(source: string): GitClient | null {
    // TODO: Get source config from database
    if (source === 'public') {
      return new GitClient({
        owner: 'jimyth',
        repo: 'claude-skill-market',
        branch: 'main',
      });
    }

    // For personal sources, we'd look up the user's repo
    return null;
  }
}
