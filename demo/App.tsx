
import React from 'react'
import './app.css'
import { Upload, UploadProps } from "antd"
import { PlusOutlined } from "@ant-design/icons"

import ImageCrop from '../.'
function App() {
  const props: UploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    listType: "picture-card",
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
    },
  };
  return (
    <>
      <ImageCrop>
        <Upload {...props}>
          <PlusOutlined style={{fontSize: '20px'}}/>
        </Upload>
      </ImageCrop>
    </>
  )
}

export default App
