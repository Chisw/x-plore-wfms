import { IItem, IOffsetInfo, IRectInfo } from './types'

export const itemSorter = (a: IItem, b: IItem) => {
  const typeDirection = a.type - b.type
  if (typeDirection !== 0) return typeDirection
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const copy = (str: string) => {
  const input = document.createElement('textarea')
  document.body.appendChild(input)
  input.value = str
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
}

export const line = (str: string) => str
  .replace(/\n/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const convertItemName = (item: IItem) => {
  const { type, name, hasChildren } = item
  return type === 1
    ? `${name}._dir${hasChildren ? '' : '_empty'}`
    : name
}

export const isSameItem = (a: IItem, b: IItem) => {
  return a.name === b.name && a.type === b.type
}

export const getBytesSize = (bytes: number, unit?: 'B' | 'KB' | 'MB' | 'GB') => {
  if (!unit) {
    if (0 <= bytes && bytes < 1024) {
      unit = 'B'
    } else if (1024 <= bytes && bytes < 1048576) {
      unit = 'KB'
    } else if (1048576 <= bytes && bytes < 1073741824) {
      unit = 'MB'
    } else {
      unit = 'GB'
    }
  }
  const level = ['B', 'KB', 'MB', 'GB'].indexOf(unit)
  const divisor = [1, 1024, 1048576, 1073741824][level]
  const result = `${(bytes / divisor).toFixed(unit === 'B' ? 0 : 1).replace('.0', '')} ${unit}`
  return result
}

export const getDownloadInfo = (currentPath: string, selectedItemList: IItem[]) => {
  const pathName = currentPath.split('/').reverse()[0]
  const len = selectedItemList.length
  const firstItem: IItem | undefined = selectedItemList[0]
  const isDownloadAll = !len
  const isDownloadSingle = len === 1
  const isDownloadSingleDir = isDownloadSingle && firstItem.type === 1
  const singleItemName = firstItem?.name

  const downloadName = isDownloadAll
    ? `${pathName}.zip`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `${singleItemName}/${singleItemName}.zip`
        : `${singleItemName}`
      : `${pathName}.zip`

  const msg = isDownloadAll
    ? `下载当前整个目录为 ${downloadName}`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `下载 ${singleItemName} 为 ${singleItemName}.zip`
        : `下载 ${downloadName}`
      : `下载 ${len} 个项目为 ${downloadName}`

  const cmd = isDownloadAll
    ? 'cmd=zip'
    : isDownloadSingle
      ? isDownloadSingleDir
        ? 'cmd=zip'
        : 'cmd=file&mime=application%2Foctet-stream'
      : `cmd=zip${selectedItemList.map(o => `&f=${o.name}`).join('')}`
  
  return { downloadName, msg, cmd }
}

export const getIsContained = (props: IRectInfo & IOffsetInfo) => {
  const {
    startX,
    startY,
    endX,
    endY,
    offsetTop,
    offsetLeft,
    offsetWidth,
    offsetHeight,
  } = props

  return offsetLeft + offsetWidth > startX &&
    offsetTop + offsetHeight > startY &&
    offsetLeft < endX &&
    offsetTop < endY
}

export function SpeedCounter(this: typeof SpeedCounter) {
  const SECONDS = 16
  const UPDATES_PER_SEC = 1
  const TIME_SPAN_BUCKET_MS = 1000 / UPDATES_PER_SEC
  const buckets: number[] = []
  for (let i = 0; i < SECONDS * UPDATES_PER_SEC; i++) {
    buckets[i] = 0
  }
  const startTime = Date.now()
  let lastUsedBucket = 0
  let bucketI = 0

  ;(this as any).tick = (bytesCopied: number) => {
    const bI = ((Date.now() - startTime) / TIME_SPAN_BUCKET_MS) & 0x7fffffff
    let upd = false
    while (bucketI !== bI) {
      upd = true
      bucketI++
      bucketI &= 0x7fffffff
      const dI = bucketI % buckets.length
      if (lastUsedBucket < dI)
        lastUsedBucket = dI
      buckets[dI] = 0
    }
    buckets[bI % buckets.length] += bytesCopied
    return upd
  }

  ;(this as any).getBytesPerSec = () => {
    var sum = 0
    for (var i = lastUsedBucket + 1; --i >= 0;) {
      if (i !== bucketI) sum += buckets[i]
    }
    return Math.floor(sum * UPDATES_PER_SEC / lastUsedBucket)
  }

  ;(this as any).isStable = () => {
    return lastUsedBucket * 2 >= buckets.length
  }
}