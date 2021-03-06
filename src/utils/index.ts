import { CALLABLE_APP_LIST } from './appList'
import { IEntry, INestFile, IOffsetInfo, IRectInfo } from './types'


export const entrySorter = (a: IEntry, b: IEntry) => {
  const map = { directory: 1, file: 2 }
  const aVal = map[a.type]
  const bVal = map[b.type]
  const typeDirection = aVal - bVal
  if (typeDirection !== 0) return typeDirection
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
}

export const getFileNameExtension = (name: string) => {
  if (!name || !name.includes('.') || name.startsWith('.')) return undefined
  return name.split('.').reverse()[0].toLowerCase()
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

export const isSameEntry = (a: IEntry, b: IEntry) => {
  return a.name === b.name && a.type === b.type
}

export const getBytesSize = (params: { bytes: number, unit?: 'B' | 'KB' | 'MB' | 'GB', keepFloat?: boolean }) => {
  let { bytes, unit, keepFloat } = params

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
  const fixedSize = (bytes / divisor).toFixed(unit === 'B' ? 0 : 1)
  const size = keepFloat ? fixedSize : fixedSize.replace('.0', '')
  return `${size} ${unit}`
}

export const getMatchAppId = (entry: IEntry) => {
  const { extension } = entry
  if (!extension) return
  return CALLABLE_APP_LIST.find(({ matchList }) => matchList!.includes(extension))?.id
}

export const getDownloadInfo = (parentPathPath: string, selectedEntryList: IEntry[]) => {
  const pathName = parentPathPath.split('/').reverse()[0]
  const len = selectedEntryList.length
  const firstEntry: IEntry | undefined = selectedEntryList[0]
  const isDownloadAll = !len
  const isDownloadSingle = len === 1
  const isDownloadSingleDir = isDownloadSingle && firstEntry.type === 'directory'
  const singleEntryName = firstEntry?.name

  const downloadName = isDownloadAll
    ? `${pathName}.zip`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `${singleEntryName}/${singleEntryName}.zip`
        : `${singleEntryName}`
      : `${pathName}.zip`

  const msg = isDownloadAll
    ? `??????????????????????????? ${downloadName}`
    : isDownloadSingle
      ? isDownloadSingleDir
        ? `?????? ${singleEntryName} ??? ${singleEntryName}.zip`
        : `?????? ${downloadName}`
      : `?????? ${len} ???????????? ${downloadName}`

  const cmd = isDownloadAll
    ? 'cmd=zip'
    : isDownloadSingle
      ? isDownloadSingleDir
        ? 'cmd=zip'
        : 'cmd=file&mime=application%2Foctet-stream'
      : `cmd=zip${selectedEntryList.map(o => `&f=${o.name}`).join('')}`
  
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

export const getEntryNestFileList = async (entry: any) => {  // any: FileSystemEntry
  const nestFileList: INestFile[] = []
  if (entry.isFile) {
    await new Promise((resolve, reject) => {
      (entry as any).file((file: File) => {  // any: FileSystemFileEntry
        const fileName = file.name
        if (fileName !== '.DS_Store' && !fileName.startsWith('._')) {
          nestFileList.push(Object.assign(file, { nestPath: entry.fullPath }))
        }
        resolve(true)
      })
    })
  } else {
    await new Promise((resolve, reject) => {
      const reader = (entry as any).createReader()  // any: FileSystemDirectoryEntry
      reader.readEntries(async (entries: any) => {  // any: FileSystemEntry[]
        for (const entry of entries) {
          const list = await getEntryNestFileList(entry)
          nestFileList.push(...list)
        }
        resolve(true)
      })
    })
  }
  return nestFileList
}

export const getDTNestFileList = async (dataTransfer: DataTransfer) => {
  const nestFileList: INestFile[] = []
  const { items } = dataTransfer as any
  // don't use `for of`
  await Promise.all([...items].map(async (item) => {
    if (item.kind === 'file' && item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry() as any // any: FileSystemEntry
      const files = await getEntryNestFileList(entry)
      nestFileList.push(...files)
    } else if (item.kind === 'string') {
      // handle string
    }
  }))
  return nestFileList
}
