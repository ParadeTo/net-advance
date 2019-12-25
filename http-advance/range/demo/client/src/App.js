import React, {useEffect, useCallback, useReducer, useRef} from 'react'
import {List, Progress, Button, Avatar} from 'antd'
import file from './file.png'
import './App.css'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

const throttle = (func, wait = 300, options) => {
  let timeout, context, args, result
  let previous = 0
  if (!options) options = {}
  const later = () => {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  const throttled = function() {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    let remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = () => {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

const formatSize = bytes => {
  if (bytes > 1 << 30) {
    return (bytes / (1 << 30)).toFixed(2) + ' GB'
  } else if (bytes > 1 << 20) {
    return (bytes / (1 << 20)).toFixed(2) + ' MB'
  } else if (bytes > 1 << 10) {
    return (bytes / (1 << 20)).toFixed(2) + ' KB'
  }
}

const initialState = {
  files: []
}

const action = {
  SET_FILES: 'SET_FILES',
  SET_FILENAME_PROGRESS: 'SET_FILENAME_PROGRESS'
}

const reducer = (state, {type, payload}) => {
  switch (type) {
    case action.SET_FILES:
      return {files: payload}
    case action.SET_FILENAME_PROGRESS:
      const index = state.files.findIndex(
        file => file.filename === payload.filename
      )
      const files = state.files
      return {
        files: [
          ...files.slice(0, index),
          {...files[index], loaded: payload.loaded},
          ...files.slice(index + 1)
        ]
      }
    default:
      throw new Error()
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const throttledFunc = useRef(throttle(({ filename, loaded }) => {
    dispatch({type: action.SET_FILENAME_PROGRESS, payload: { filename, loaded }})
  }))
  useEffect(() => {
    ipcRenderer.send('getFiles')
    ipcRenderer.on('getFilesSucc', (sender, data) => {
      dispatch({type: action.SET_FILES, payload: data})
    })
    ipcRenderer.on('progress', (sender, {filename, loaded, total}) => {
      throttledFunc.current({ filename, loaded })
    })
  }, [])

  const download = useCallback(filename => {
    ipcRenderer.send('download', filename)
  }, [])

  const stop = useCallback(filename => {
    ipcRenderer.send('stop', filename)
  }, [])

  return (
    <div className='App'>
      <List
        size='small'
        header={<strong>文件列表</strong>}
        bordered
        dataSource={state.files}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={file} />}
              title={<a href='https://ant.design'>{item.filename}</a>}
              description={formatSize(item.size)}
            />
            <div style={{width: '500px'}}>
              <Button
                type='primary'
                style={{marginRight: '50px'}}
                onClick={() => download(item.filename)}>
                下载
              </Button>
              <Button onClick={() => stop(item.filename)}>停止</Button>
              <Progress style={{alignSelf: ''}} percent={(item.loaded/item.size * 100).toFixed(1)} status='active' />
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}

export default App
