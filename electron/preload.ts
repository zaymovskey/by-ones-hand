import { contextBridge, ipcRenderer } from 'electron';
import { SAVE_CHANNELS, type SavesAPI } from '../shared/saves';

const saves: SavesAPI = {
  read: (slot) => ipcRenderer.invoke(SAVE_CHANNELS.read, slot),
  write: (slot, document) => ipcRenderer.invoke(SAVE_CHANNELS.write, slot, document),
};
contextBridge.exposeInMainWorld('saves', saves);