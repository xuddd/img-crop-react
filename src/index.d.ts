import { ModalFuncProps } from "antd";

type Size = {
  width: number;
  height: number;
};

type CropSize = {
  x: number;
  y: number;
} & Size;

type ImageSize = {
  zoom: number;
} & CropSize;

/**
 * 表示裁剪得到的图片尺寸计算方式，
 * pixel：按裁剪框的尺寸1:1，
 * percent：按裁剪框尺寸和原图的比例
 */
type ClipType = 'pixel'|'percent';

interface ImageCropProps {
  onModalOk?: () => void;
  onModalCancel?: () => void;
  quality?: number;
  clipSize?: Size;
  clipType?: ClipType;
  zoomStep?: number;
  minZoom?: number;
  maxZoom?: number;
  modalProps?: ModalFuncProps
  children: React.ReactNode & UploadProps;
}

export {
  ClipType,
  Size,
  ImageSize,
  CropSize,
  ImageCropProps
}