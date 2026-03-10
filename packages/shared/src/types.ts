/**
 * Marketplace shared types
 */

// Extension types
export type ExtensionType = 'skill' | 'plugin';

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  type: ExtensionType;
  author: string;
  description: string;
  tags?: string[];
  entry?: string;
  commands?: ExtensionCommand[];
  changelog?: ChangelogEntry[];
}

export interface ExtensionCommand {
  id: string;
  file: string;
  description?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Index types
export interface MarketIndex {
  version: string;
  owner: string;
  updated?: string;
  skills: IndexEntry[];
  plugins?: IndexEntry[];
}

export interface IndexEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  path: string;
  files: string[];
  tags?: string[];
}

// User types
export interface User {
  id: string;
  apiKeyHash: string;
  githubId?: string;
  githubToken?: string;  // encrypted
  personalRepo?: string;
  createdAt: string;
}

export interface UserConfig {
  apiKey: string;
}

// Cache types
export interface InstalledExtension {
  id: string;
  version: string;
  source: 'personal' | 'public';
  installedAt: string;
  path: string;
}

export interface CacheData {
  installed: InstalledExtension[];
  lastIndexUpdate?: string;
}
