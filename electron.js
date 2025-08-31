const { app, BrowserWindow, Menu, BrowserView, ipcMain, shell, session } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let browserView;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'client/public/SerCrow logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    backgroundColor: '#ffffff',
    title: 'SerCrow - Private Search Engine'
  });

  // Set up privacy-focused session
  const ses = session.defaultSession;
  
  // Block ads and trackers
  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const url = details.url.toLowerCase();
    const blockedDomains = [
      'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
      'facebook.com/tr', 'google-analytics.com', 'googletagmanager.com',
      'scorecardresearch.com', 'outbrain.com', 'taboola.com'
    ];
    
    const shouldBlock = blockedDomains.some(domain => url.includes(domain));
    callback({ cancel: shouldBlock });
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
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

  // Create and attach BrowserView for integrated browsing
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });
  
  // Initially hide the browser view
  browserView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  browserView.setAutoResize({ width: true, height: true });

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

// Enhanced IPC handlers
ipcMain.on('toMain', (event, data) => {
  switch (data.type) {
    case 'navigate':
      if (!browserView) return;
      let url = data.url;
      
      // Smart URL handling
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
          url = 'https://' + url;
        } else {
          url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
        }
      }
      
      mainWindow.setBrowserView(browserView);
      const bounds = mainWindow.getBounds();
      browserView.setBounds({ x: 0, y: 140, width: bounds.width, height: bounds.height - 140 });
      
      browserView.webContents.loadURL(url);
      break;
      
    case 'goBack':
      if (browserView && browserView.webContents.canGoBack()) {
        browserView.webContents.goBack();
      }
      break;
      
    case 'goForward':
      if (browserView && browserView.webContents.canGoForward()) {
        browserView.webContents.goForward();
      }
      break;
      
    case 'reload':
      if (browserView) {
        browserView.webContents.reload();
      }
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
