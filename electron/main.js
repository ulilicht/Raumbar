const {app, Menu, Tray, dialog, BrowserWindow} = require('electron');
const {menubar} = require('menubar');
const path = require('path');
const shell = require('electron').shell;

let mb;

const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "../build/index.html")}`;
const isDevelopmentMode = process.env.RAUMBAR_DEVELOPMENT_MODE === "true";

function createMenubar() {
    const iconPath = path.join(__dirname, '..', 'public', 'speaker-icon.Template@2x.png');

    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Spotify', type: 'normal', click: () => {
                shell.openPath('/Applications/Spotify.app')
                    .then(message => message.length > 0 && dialog.showErrorBox('Could not open Spotify', 'Please make sure Spotify is installed in /Applications/Spotify.app'));
            }
        },
        {
            label: 'Report issue', type: 'normal', click: () => {
                shell.openExternal('https://github.com/ulilicht/Raumbar/issues')
            }
        },
        {label: 'Quit Raumbar', type: 'radio', role: 'quit'},
    ])

    mb = menubar({
        index: startUrl,
        tray: tray,
        browserWindow: {
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
            vibrancy: 'light',
            visualEffectState: "active",
            alwaysOnTop: true,
            width: 410,
            height: 450
        },
        preloadWindow: true
    });

    tray.on('right-click', function (event) {
        tray.popUpContextMenu(contextMenu);
    });

    mb.on('show', () => {
        if (mb.window) {
            mb.window.setOpacity(1); // reset the opacity which was set with the fade-out effect.
        }
    });

    mb.on('focus-lost', () => fadeOut(mb));

    if (isDevelopmentMode) {
        mb.on('after-create-window', () => {
            let devtools = new BrowserWindow();
            mb.window.webContents.setDevToolsWebContents(devtools.webContents);
            mb.window.webContents.openDevTools({ mode: 'detach' });
        });
    }
}

app.on('ready', createMenubar);

if (!isDevelopmentMode) {
    console.log('Will attempt to set Raumbar as startup application.');
    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true
    });
}


function fadeOut(mb) {
    const step = 0.1;
    const fadeEveryXSeconds = 15;
    if (!mb.window) {
        return;
    }

    let opacity = mb.window.getOpacity();

    const interval = setInterval(() => {
        mb.window.setOpacity(opacity);
        opacity -= step;

        if (opacity <= 0.2) {
            clearInterval(interval);
            mb.hideWindow();
        }
    }, fadeEveryXSeconds);
}