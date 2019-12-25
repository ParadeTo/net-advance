const electron = require('electron')
const {ipcMain} = require('electron')
const Downloader = require('./download')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, './public/index.html')}`
  )
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools()
  }
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const downloadMap = {}
ipcMain.on('download', (event, filename) => {
  try {
    if (!downloadMap[filename]) {
      downloadMap[filename] = new Downloader(filename)
    }
    downloadMap[filename].download()
    downloadMap[filename].on('progress', ({ payload: { loaded, total } }) => {
      event.sender.send('progress', { filename, loaded, total })
    })
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('stop', (event, filename) => {
  if (downloadMap[filename]) {
    downloadMap[filename].stop()
  }
})

ipcMain.on('getFiles', async (event) => {
  try {
    const files = await Downloader.getFiles()
    event.sender.send('getFilesSucc', files)
  } catch (error) {
    console.error(error)
  }
})
