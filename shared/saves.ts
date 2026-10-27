export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export interface SaveDocument { version: 1; data: JsonValue }
export interface SavesAPI {
  read(slot: string): Promise<SaveDocument | null>;
  write(slot: string, document: SaveDocument): Promise<void>;
}
export const SAVE_CHANNELS = { read: 'saves:read', write: 'saves:write' } as const;