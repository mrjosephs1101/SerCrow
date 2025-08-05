const { app, BrowserWindow, Menu, BrowserView, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let browserView;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'client/public/favicon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'client/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    browserView = null;
  });

  // Create and attach BrowserView
  browserView = new BrowserView();
  mainWindow.setBrowserView(browserView);
  browserView.setBounds({ x: 0, y: 70, width: 1200, height: 730 });
  browserView.setAutoResize({ width: true, height: true });
  browserView.webContents.loadURL('https://www.google.com');

  // Set up menu
  const template = [
    {
      label: 'SerCrow',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

// IPC handlers
ipcMain.on('toMain', (event, data) => {
  if (!browserView) return;

  switch (data.type) {
    case 'navigate':
      let url = data.url;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      browserView.webContents.loadURL(url);
      break;
    case 'goBack':
      if (browserView.webContents.canGoBack()) {
        browserView.webContents.goBack();
      }
      break;
    case 'goForward':
      if (browserView.webContents.canGoForward()) {
        browserView.webContents.goForward();
      }
      break;
    case 'reload':
      browserView.webContents.reload();
      break;
  }
});

// Send navigation state changes to renderer
function sendNavState() {
  if (mainWindow && browserView) {
    const { webContents } = browserView;
    const navState = {
      type: 'nav-state-change',
      canGoBack: webContents.canGoBack(),
      canGoForward: webContents.canGoForward(),
      url: webContents.getURL(),
    };
    mainWindow.webContents.send('fromMain', navState);
  }
}

// Listen for navigation events
app.whenReady().then(() => {
  if (browserView) {
    const { webContents } = browserView;
    webContents.on('did-start-navigation', sendNavState);
    webContents.on('did-navigate', sendNavState);
    webContents.on('did-finish-load', sendNavState);
    webContents.on('did-fail-load', sendNavState);
    webContents.on('did-stop-loading', sendNavState);
    webContents.on('dom-ready', sendNavState);
  }
});
