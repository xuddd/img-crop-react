# img-crop-react

基于react、antd的图片裁剪，详细使用见demo

## 安装包

npm install img-crop-react -S

## 使用

`import {Upload, UploadProps} from 'antd';`

`import ImageCrop from 'img-crop-react';`

`function App() {`

`  const props: UploadProps = {`

`    action: '`<https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188>`',`

`    headers: { authorization: 'authorization-text', },`

`    listType: 'picture-card'`

`  }`

`  return (<ImageCrop>`

`    <Upload {...props}>上传</Upload>`

`  </ImageCrop>)`

`}`

`export default App`

