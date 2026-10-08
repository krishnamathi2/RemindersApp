const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Security-first initialization
app.enableSandbox();

let mainWindow;

// Create secure preload script
const preloadPath = path.join(__dirname, 'preload.js');
if (!fs.existsSync(preloadPath)) {
  fs.writeFileSync(preloadPath, `
    const { contextBridge, ipcRenderer } = require('electron');
    
    // Strictly expose only required APIs
    contextBridge.exposeInMainWorld('electronAPI', {
      getReminders: () => ipcRenderer.invoke('get-reminders'),
      saveReminders: (reminders) => ipcRenderer.invoke('save-reminders', reminders),
      requestMicrophone: () => ipcRenderer.invoke('request-microphone')
    });
  `);
}

function createWindow() {
  // Secure window configuration
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: preloadPath,
      devTools: !app.isPackaged
    }
  });

  // Strict CSP configuration
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          // Base restrictions
          "default-src 'none';",  // Default: block everything
          
          // Strict CSP for scripts (recommended approach)
          "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';",
          
          // Style restrictions
          "style-src 'self' 'unsafe-inline';",
          
          // Font restrictions (self-hosted fonts only)
          "font-src 'self';",
          
          // Image restrictions
          "img-src 'self' data: blob:;",
          
          // Connect restrictions
          "connect-src 'self';",
          
          // Media restrictions (for voice recording)
          "media-src 'self' blob:;",
          
          // Frame restrictions
          "frame-src 'none';",
          
          // Form action restrictions
          "form-action 'none';",
          
          // Worker restrictions
          "worker-src 'self';"
        ].join(' ')
      }
    });
  });

  // Load app page with error handling
  mainWindow.loadFile(path.join(__dirname, 'templates', 'voice-assistant.html'))
    .then(() => {
      mainWindow.show();
      if (!app.isPackaged) {
        mainWindow.webContents.openDevTools({ mode: 'bottom' });
      }
    })
    .catch(err => {
      console.error('Window load error:', err);
      showErrorPage(err);
    });

  mainWindow.on('closed', () => (mainWindow = null));
}

// [Rest of your existing code: IPC handlers, error handling, app lifecycle]
// ... (keep all your existing ipcMain handlers, error handling functions, etc.)

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});