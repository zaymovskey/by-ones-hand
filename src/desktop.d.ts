import type { SavesAPI } from '../shared/saves';
declare global {
  interface Window { readonly saves: SavesAPI }
}