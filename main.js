const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
    // OS X
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() {
                    app.quit();
                }
            },
        ]
    })
}


//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}

async function createDefaultWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.webContents.openDevTools();
    win.on('closed', function () {
        win = null;
    });
    await win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    return win;
}

autoUpdater.on('checking-for-update', function () {
    sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', function (ev, info) {
    sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', function (ev, info) {
    sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', function (ev, err) {
    // sendStatusToWindow('Error in auto-updater.');
    sendStatusToWindow(err);
})

autoUpdater.on('download-progress', function (ev, progressObj) {
    sendStatusToWindow('Download progress...');
})

autoUpdater.on('update-downloaded', function (ev, info) {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

app.on('ready', async function () {
    // Create the Menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    await createDefaultWindow();
});

app.on('window-all-closed', function () {
    app.quit();
});

ipcMain.on("check-updates", async (event, server_host) => {
    if (!server_host) server_host = 'http://10.0.1.195:3000'
    const url = new URL(`/api/update/`, server_host)
    autoUpdater.allowDowngrade = true
    autoUpdater.setFeedURL({
        // provider: 'custom',
        // url: url.toString(),
        provider: 'generic',
        url: 'http://localhost:3000/api/update/',
        // account: 'userX'
    });
    await autoUpdater.checkForUpdates();

    // Send result back to renderer process
    // win.webContents.send("check-updates-reply", {
    //     host: server_host,
    //     platform: process.platform,
    //     version: app.getVersion(),
    //     url: url.toString()
    // });
});

autoUpdater.on('update-downloaded', function (ev, info) {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    setTimeout(function () {
        autoUpdater.quitAndInstall();
    }, 5000)
})
