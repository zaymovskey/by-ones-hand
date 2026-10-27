import { app, BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SAVE_CHANNELS } from '../shared/saves';
import { SaveStore } from './save-store';

let window: BrowserWindow | null = null;
const rendererFile = join(__dirname, '../renderer/index.html');
const devURL = !app.isPackaged ? process.env.ELECTRON_RENDERER_URL : undefined;
const trustedURL = devURL ? new URL(devURL).href : pathToFileURL(rendererFile).href;

function assertSender(event: IpcMainInvokeEvent): void {
  if (!window || event.sender !== window.webContents || !event.senderFrame ||
      event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== trustedURL) {
    throw new Error('Untrusted IPC sender.');
  }
}
function createWindow(): void {
  window = new BrowserWindow({
    title: "By One's Hand", width: 1280, height: 800, backgroundColor: '#151719',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  window.webContents.session.setPermissionCheckHandler(() => false);
  window.on('closed', () => { window = null; });
  if (devURL) void window.loadURL(devURL);
  else void window.loadFile(rendererFile);
}
app.whenReady().then(() => {
  const store = new SaveStore(join(app.getPath('userData'), 'saves'));
  ipcMain.handle(SAVE_CHANNELS.read, (event, slot: unknown) => {
    assertSender(event); return store.read(slot);
  });
  ipcMain.handle(SAVE_CHANNELS.write, (event, slot: unknown, document: unknown) => {
    assertSender(event); return store.write(slot, document);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });