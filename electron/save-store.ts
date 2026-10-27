import { mkdir, readFile, rename, unlink, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SaveDocument } from '../shared/saves';

const MAX_BYTES = 1024 * 1024;
function validateSlot(slot: unknown): asserts slot is string {
  if (typeof slot !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,47}$/.test(slot)) {
    throw new Error('Slot must contain 1–48 lowercase letters, digits, underscores or hyphens.');
  }
}
export function validateDocument(value: unknown): asserts value is SaveDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid save document.');
  const doc = value as Record<string, unknown>;
  if (doc.version !== 1 || !Object.hasOwn(doc, 'data') || Object.keys(doc).some(k => k !== 'version' && k !== 'data')) throw new Error('Unsupported save format.');
  const visit = (v: unknown, depth: number): void => {
    if (depth > 64) throw new Error('Save is too deeply nested.');
    if (v === null || typeof v === 'boolean' || typeof v === 'string') return;
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (Array.isArray(v)) { v.forEach(item => visit(item, depth + 1)); return; }
    if (typeof v === 'object' && v && Object.getPrototypeOf(v) === Object.prototype) {
      Object.values(v).forEach(item => visit(item, depth + 1)); return;
    }
    throw new Error('Save data must contain only JSON values.');
  };
  visit(doc.data, 0);
}
export class SaveStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly directory: string) {}
  // Serialize operations so concurrent writes/reads observe complete documents.
  private run<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.queue.then(operation);
    this.queue = next.catch(() => undefined);
    return next;
  }
  read(slot: unknown): Promise<SaveDocument | null> {
    return this.run(async () => {
      validateSlot(slot);
      const file = join(this.directory, `${slot}.json`);
      try {
        const info = await lstat(file);
        if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_BYTES) throw new Error('Invalid save file.');
        const text = await readFile(file, 'utf8');
        if (Buffer.byteLength(text) > MAX_BYTES) throw new Error('Save exceeds 1 MiB.');
        const document: unknown = JSON.parse(text);
        validateDocument(document);
        return document;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    });
  }
  write(slot: unknown, document: unknown): Promise<void> {
    return this.run(async () => {
      validateSlot(slot);
      validateDocument(document);
      const text = JSON.stringify(document, null, 2);
      if (Buffer.byteLength(text) > MAX_BYTES) throw new Error('Save exceeds 1 MiB.');
      await mkdir(this.directory, { recursive: true });
      const temporary = join(this.directory, `${slot}.${randomUUID()}.tmp`);
      try {
        const { writeFile } = await import('node:fs/promises');
        await writeFile(temporary, text, { flag: 'wx' });
        await rename(temporary, join(this.directory, `${slot}.json`));
      } finally { await unlink(temporary).catch(() => undefined); }
    });
  }
}