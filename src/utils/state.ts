import { atom } from 'recoil'
import { IApp, IRootInfo, ITransferItem } from './types'

export const topWindowIndexState = atom<number>({
  key: 'topWindowIndexState',
  default: 0,
})

export const runningAppListState = atom<IApp[]>({
  key: 'runningAppListState',
  default: [],
})

export const rootInfoState = atom<IRootInfo>({
  key: 'rootInfoState',
  default: {
    deviceName: '--',
    volumeList: [],
  },
})

export const sizeMapState = atom<{ [KEY: string]: number }>({
  key: 'sizeMapState',
  default: {},
})

export const transferItemListState = atom<ITransferItem[] | null>({
  key: 'transferItemListState',
  default: null,
})