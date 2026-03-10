import yaml from 'js-yaml';
import { MarketIndex, IndexEntry } from '../types';

/**
 * Parse index.yaml content
 */
export function parseIndexYaml(content: string): MarketIndex {
  const data = yaml.load(content) as Record<string, unknown>;

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid index.yaml: must be a valid YAML object');
  }

  if (!Array.isArray(data.skills)) {
    throw new Error('Invalid index.yaml: skills must be an array');
  }

  return {
    version: String(data.version || '1.0'),
    owner: String(data.owner || ''),
    updated: data.updated ? String(data.updated) : undefined,
    skills: data.skills.map(parseIndexEntry),
    plugins: Array.isArray(data.plugins) ? data.plugins.map(parseIndexEntry) : undefined,
  };
}

function parseIndexEntry(entry: Record<string, unknown>): IndexEntry {
  if (!entry.id || !entry.name || !entry.path) {
    throw new Error('Invalid index entry: missing required fields (id, name, path)');
  }

  return {
    id: String(entry.id),
    name: String(entry.name),
    version: String(entry.version || '1.0.0'),
    description: String(entry.description || ''),
    author: String(entry.author || ''),
    path: String(entry.path),
    files: Array.isArray(entry.files) ? entry.files.map(String) : [],
    tags: Array.isArray(entry.tags) ? entry.tags.map(String) : undefined,
  };
}

/**
 * Generate index.yaml content
 */
export function generateIndexYaml(index: MarketIndex): string {
  const data: Record<string, unknown> = {
    version: index.version,
    owner: index.owner,
    updated: index.updated || new Date().toISOString().split('T')[0],
    skills: index.skills,
  };

  if (index.plugins && index.plugins.length > 0) {
    data.plugins = index.plugins;
  }

  return yaml.dump(data, { indent: 2, lineWidth: -1 });
}
