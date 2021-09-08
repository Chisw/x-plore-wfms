import { useEffect } from 'react'
import { AppComponentProps } from '../utils/types'

export default function BaiduMap(props: AppComponentProps) {

  const { setHeaderLoading } = props

  useEffect(() => {
    setHeaderLoading(true)
  }, [setHeaderLoading])

  return (
    <>
      <div className="absolute inset-0">
        <iframe
          title="app"
          className="w-full h-full"
          src="https://map.baidu.com"
          onLoad={() => setHeaderLoading(false)}
        />
      </div>
    </>
  )
}