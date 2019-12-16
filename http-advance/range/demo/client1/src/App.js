import React, {useEffect, useState, useCallback} from 'react'
import {List, Progress, Button, Avatar} from 'antd'
// import { ipcRenderer } from 'electron'
import file from './file.png'
import './App.css'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

const formatSize = bytes => {
  if (bytes > 1 << 30) {
    return (bytes / (1 << 30)).toFixed(2) + ' GB'
  } else if (bytes > 1 << 20) {
    return (bytes / (1 << 20)).toFixed(2) + ' MB'
  } else if (bytes > 1 << 10) {
    return (bytes / (1 << 20)).toFixed(2) + ' KB'
  }
}

function App() {
  const [files, setFiles] = useState([])
  useEffect(() => {
    ipcRenderer.send('getFiles')
    ipcRenderer.on('getFilesSucc', (sender, data) => {
      setFiles(JSON.parse(data))
    })
  }, [])

  const download = useCallback(filename => {
    ipcRenderer.send('download', filename)
  }, [])
  return (
    <div className='App'>
      <List
        size='small'
        header={<strong>文件列表</strong>}
        bordered
        dataSource={files}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={file} />}
              title={<a href='https://ant.design'>{item.filename}</a>}
              description={formatSize(item.size)}
            />
            <div style={{width: '500px'}}>
              <Button type='primary' style={{marginRight: '50px'}} onClick={() => download(item)}>
                下载
              </Button>
              <Button>停止</Button>
              <Progress style={{alignSelf: ''}} percent={50} status='active' />
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}

export default App
