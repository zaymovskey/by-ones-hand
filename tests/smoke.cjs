const { app, BrowserWindow } = require('electron');
const { mkdtempSync, rmSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const assert = require('node:assert/strict');
const temporary = mkdtempSync(join(tmpdir(), 'by-ones-hand-smoke-'));
app.setPath('userData', temporary);
const timeout = setTimeout(() => { console.error('Smoke test timed out'); app.exit(1); }, 30000);
// Load the actual production main: tests use its window, IPC and preload.
require('../out/main/main.cjs');
app.whenReady().then(async () => {
  try {
    const [window] = BrowserWindow.getAllWindows();
    if (window.webContents.isLoading()) await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    const preferences = window.webContents.getLastWebPreferences();
    assert.equal(preferences.contextIsolation, true);
    assert.equal(preferences.nodeIntegration, false);
    assert.equal(preferences.sandbox, true);
    assert.equal(await window.webContents.executeJavaScript('typeof require'), 'undefined');
    assert.equal(await window.webContents.executeJavaScript('document.querySelectorAll("canvas").length'), 1);
    const result = await window.webContents.executeJavaScript(`(async () => {
      const missing = await window.saves.read('missing');
      await window.saves.write('smoke', {version: 1, data: {message: 'Привет', count: 42}});
      const saved = await window.saves.read('smoke');
      await window.saves.write('smoke', {version: 1, data: {count: 43}});
      const updated = await window.saves.read('smoke');
      const rejects = [];
      for (const operation of [
        () => window.saves.write('../escape', {version:1,data:null}),
        () => window.saves.write('bad', {version:2,data:null}),
        () => window.saves.write('large', {version:1,data:'x'.repeat(1048577)})
      ]) { try { await operation(); rejects.push(false); } catch { rejects.push(true); } }
      return {missing, saved, updated, rejects};
    })()`);
    assert.equal(result.missing, null);
    assert.equal(result.saved.data.message, 'Привет');
    assert.equal(result.updated.data.count, 43);
    assert.deepEqual(result.rejects, [true,true,true]);
    assert.equal(JSON.parse(readFileSync(join(temporary,'saves','smoke.json'),'utf8')).data.count,43);
    await window.loadFile(join(__dirname, '../out/renderer/index.html'));
    assert.equal(await window.webContents.executeJavaScript('(async()=> (await window.saves.read("smoke")).data.count)()'),43);
    // A second window must not be able to use the privileged handlers.
    const foreign = new BrowserWindow({show:false,webPreferences:{preload:join(__dirname,'../out/preload/preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    await foreign.loadFile(join(__dirname,'../out/renderer/index.html'));
    const rejected = await foreign.webContents.executeJavaScript('(async()=>{try{await window.saves.read("smoke");return false}catch{return true}})()');
    assert.equal(rejected,true);
    foreign.destroy();
    console.log('PASS: production window, Phaser canvas, isolated preload, JSON round-trip, overwrite, reload persistence, invalid slot/schema/size.');
    clearTimeout(timeout);
    window.destroy();
    app.quit();
  } catch (error) { console.error(error); clearTimeout(timeout); app.exit(1); }
});
app.on('will-quit', () => { rmSync(temporary, {recursive:true,force:true}); });
