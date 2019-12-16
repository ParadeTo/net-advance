const fs = require('fs')

const getFileInfo = filename => {
  return fs.statSync(filename)
}

console.log(getFileInfo('bigFile.iso'))