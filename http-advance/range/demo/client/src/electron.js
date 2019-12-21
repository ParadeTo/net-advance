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
  if (!downloadMap[filename]) {
    const downloader = new Downloader(filename)
    downloader.download()
    downloader.on('progress', ({ payload: { loaded } }) => {
      console.log('progress', loaded)
      event.sender.send('progress', { filename: downloader.filename, loaded })
    })
    downloadMap[filename] = downloader
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
