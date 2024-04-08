import React, { useMemo, useRef, useState } from 'react';
import { Modal, ModalProps } from 'antd';
import content from './index.css';
import { CropSize, ImageSize, ImageCropProps, Size } from './index.d'

const ImageCrop: React.FC<ImageCropProps> = props => {
  const defaultClipSize: Size = {
    width: 600,
    height: 600
  }

  const defaultModalProps: ModalProps = {
    className: 'image-crop-modal',
    width: '80vw',
    closable: false,
    okText: '确定',
    cancelText: '取消',
    title: '裁剪',
  }

  const {
    children, 
    onModalCancel,
    onModalOk, 
    clipSize = defaultClipSize,
    clipType = 'pixel',
    modalProps = defaultModalProps,
    zoomStep = 0.1,
    minZoom = 0.1,
    maxZoom = 3,
    quality = 0.4
  } = props;
  const [isShowModal, setIsShowModal] = useState(false);
  const cb = useRef<Pick<ImageCropProps, 'onModalCancel' | 'onModalOk'>>({});
  cb.current.onModalOk = onModalOk;
  cb.current.onModalCancel = onModalCancel;

  
  const onOK = useRef<ModalProps['onOk']>();
  const onCancel = useRef<ModalProps['onCancel']>();

  const getCropCanvas = (imageSize: ImageSize, cropSize: CropSize) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imgEle = document.getElementById('image-media');
    if (!ctx || !imgEle) return null;
    const { width, height, zoom } = imageSize;
    console.log(clipType);
    
    const sWidth = width / zoom;
    const sHeight = height / zoom;

    const dWidth = width;
    const dHeight = height;

    canvas.width = cropSize.width;
    canvas.height = cropSize.height;
    ctx.drawImage(
      imgEle as CanvasImageSource,
      0,
      0,
      sWidth,
      sHeight,
      cropSize.x,
      cropSize.y,
      dWidth,
      dHeight
    );

    return canvas;
  };

  const getNewBoforeUpload = (fn: Function) => {
    const newFn = async function(file: any) {
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const base64 = fileReader.result;
          setCropImage(base64);
          setIsShowModal(true);
        };
        fileReader.readAsDataURL(file);
        onOK.current = async function() {
          fn && fn(file);
          const canvas = getCropCanvas(imageSize.current, cropSize.current);
          canvas?.toBlob(bolb => {
            const newFile = new File([bolb as BlobPart], file.name, {
              type: file.type,
            });
            resolve(newFile);
          }, file.type, quality);
          setIsShowModal(false);
          resetModal();
        };

        onCancel.current = async function() {
          resolve(file)
          setIsShowModal(false);
        };
      });
    };

    return newFn;
  };

  function resetModal() {
    setCropImage(null)
    update(0, 0, 0, 0, 1)
  }

  const getNewUpload = (child: React.ReactNode) => {
    const upload = Array.isArray(child) ? child[0] : child;
    const { beforeUpload, ...orginProps } = upload.props;
    return {
      ...upload,
      props: {
        ...orginProps,
        beforeUpload: getNewBoforeUpload(beforeUpload),
      },
    };
  };

  const [cropImage, setCropImage] = useState<string | ArrayBuffer | null>('');
  const imageSize = useRef<ImageSize>({
    width: 0,
    height: 0,
    zoom: 1,
    x: 0,
    y: 0,
  });

  const [transform, setTransform] = useState('');
  const cropSize = useRef<CropSize>({
    ...defaultClipSize,
    x: 0,
    y: 0,
  });

  const [isStart, setIsStart] = useState(false);

  const onMove = useMemo(() => {
    return isStart ? handleMove : undefined
  }, [isStart]);

  // const onMove = useRef<React.MouseEventHandler>()
  const domMap = new Map();

  if(clipSize) {
    cropSize.current.width = clipSize.width||defaultClipSize.width
    cropSize.current.height = clipSize.height||defaultClipSize.height
  }

  function getDom(id: string) {
    if (domMap.has(id)) {
      return domMap.get(id);
    } else {
      const dom = document.getElementById(id);
      domMap.set(id, dom);
      return dom;
    }
  }

  function onScale(e: React.WheelEvent) {
    const updateY = e.deltaY;
    const speed = zoomStep;
    const zoom = imageSize.current.zoom - (speed * updateY) / 200;
    const imgEle = getDom('image-media');

    if (!imgEle || zoom > maxZoom || zoom < minZoom) {
      return;
    }
    // 计算media与容器的相对位置
    const childRect = imgEle.getBoundingClientRect();

    const imgWidht = childRect.width;
    const imgHeight = childRect.height;

    update(imgWidht, imgHeight, imageSize.current.x, imageSize.current.y, zoom);
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setIsStart(true);
    // onMove.current = handleMove
  }

  function onMouseUp(e: React.MouseEvent) {
    e.preventDefault();

    setIsStart(false);
    // onMove.current = undefined
  }

  let frameNum: number;

  function handleMove(e: React.MouseEvent) {
    e.preventDefault();
    console.log('move');
    frameNum && cancelAnimationFrame(frameNum);

    frameNum = requestAnimationFrame(() => {
      imageSize.current.x += e.movementX;
      imageSize.current.y += e.movementY;
      update(imageSize.current.width, imageSize.current.height, imageSize.current.x, imageSize.current.y, imageSize.current.zoom);
    });
  }

  /**
   * 移动，缩放图片
   * @returns
   */
  function update(
    imgWidth: number,
    imgHeight: number,
    imgX: number,
    imgY: number,
    imgZoom: number
  ) {
    setTransform(`translate(${imgX}px, ${imgY}px) scale(${imgZoom})`);
    // console.log('update');
    
    imageSize.current = {
      width: imgWidth,
      height: imgHeight,
      x: imgX,
      y: imgY,
      zoom: imgZoom,
    }

    const imgEle = getDom('image-media');
    const clipEle = getDom('clip-area');
    let pointX = 0, pointY = 0
    if(imgEle && clipEle) {
      // 计算media与容器的相对位置
      const childRect = imgEle.getBoundingClientRect();
      const parentRect = clipEle.getBoundingClientRect();
      pointX = childRect.left - parentRect.left;
      pointY = childRect.top - parentRect.top;
    }
    cropSize.current.x = pointX;
    cropSize.current.y = pointY;
  }

  let hasStyle = false;
  for (let index = 0; index < document.head.children.length; index++) {
    const element = document.head.children[index];
    const attr = element.getAttribute('data-id')
    if(attr === 'img-crop-react-css') {
      hasStyle = true
      continue
    }
  }
  if(!hasStyle) {
    const s = document.createElement('style')
    s.innerHTML = content
    s.setAttribute('data-id', 'img-crop-react-css')
    document.head.appendChild(s)
  }
  

  return (
    <>
      <div className='image-crop'>
        <div className="image-upload">
          <div className="image-view"></div>
          <div className="upload-trigger">{getNewUpload(children)}</div>
        </div>
        <Modal
          {...modalProps}
          open={isShowModal}
          onCancel={onCancel.current}
          onOk={onOK.current}
        >
          <div className="image-crop-modal">
            <div
              className="container"
              onWheel={onScale}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMove}
              onLoad={() => console.log('child loaded')}
            >
              {cropImage && (
                <img
                  className="image-media"
                  style={{ transform: transform }}
                  id="image-media"
                  src={cropImage as string}
                />
              )}
              <div className="clip-area" id="clip-area"></div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};
export default ImageCrop;
