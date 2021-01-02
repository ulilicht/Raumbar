const {app, Menu, Tray} = require('electron');
const {menubar} = require('menubar');
const path = require('path');

let mb;

const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "../build/index.html")}`;
const isDevelopmentMode = process.env.RAUMBAR_DEVELOPMENT_MODE === "true";


function createMenubar() {
    const iconPath = path.join(__dirname, '..', 'public', 'speaker-icon@2x.png');

    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Toggle Developer Tools', type: 'normal', role: 'toggleDevTools'},
        {label: 'Quit Raumbar', type: 'radio', role: 'quit'},
    ])

    mb = menubar({
        index: startUrl,
        tray: tray,
        browserWindow: {
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
            vibrancy: 'light'
        }
    });

    tray.on('right-click', function (event) {
        tray.popUpContextMenu(contextMenu);
    });
}

app.on('ready', createMenubar);

if (!isDevelopmentMode) {
    console.log('Will attempt to set Raumbar as startup application.');
    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true
    });
}