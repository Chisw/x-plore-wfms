import { useEffect } from 'react'

interface useDragSelectProps {
  rectRef: any
  containerRef: any
  containerInnerRef: any
  onDragging: (info: { startX: number, startY: number, endX: number, endY: number }) => void
}

export default function useDragSelect(props: useDragSelectProps) {

  const {
    rectRef,
    containerRef,
    containerInnerRef,
    onDragging,
  } = props

  useEffect(() => {

    const rect: any = rectRef.current
    const container: any = containerRef.current
    const containerInner: any = containerInnerRef.current
    if (!rect || !container || !containerInner) return

    let isMouseDown = false
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0
    let rectTop = 0
    let rectLeft = 0
    let rectWidth = 0
    let rectHeight = 0
    let containerTop = 0
    let containerLeft = 0
    let containerInnerWidth = 0
    let containerInnerHeight = 0

    const mousedownListener = (e: any) => {

      const isLeftClick = e.which === 1
      if (!isLeftClick) return

      isMouseDown = true

      const event = window.event || e
      const { top, left } = container.getBoundingClientRect()
      const { width, height } = containerInner.getBoundingClientRect()

      containerTop = top
      containerLeft = left
      containerInnerWidth = width
      containerInnerHeight = height

      startX = (event.x || event.clientX) - containerLeft
      startY = (event.y || event.clientY) - containerTop + container.scrollTop
      rect.style.left = `${startX}px`
      rect.style.top = `${startY}px`
    }

    const mousemoveListener = (e: any) => {
      if (isMouseDown) {
        const event: any = window.event || e
        endX = (event.x || event.clientX) - containerLeft
        endY = (event.y || event.clientY) - containerTop + container.scrollTop

        const borderOffset = -2
        const maxWidth = endX > startX
          ? containerInnerWidth - startX + borderOffset
          : startX
        const maxHeight = endY > startY
          ? containerInnerHeight - startY + borderOffset
          : startY

        rectTop = Math.max(Math.min(endY, startY), 0)
        rectLeft = Math.max(Math.min(endX, startX), 0)
        rectWidth = Math.min(Math.abs(endX - startX), maxWidth)
        rectHeight = Math.min(Math.abs(endY - startY), maxHeight)

        rect.style.top = `${rectTop}px`
        rect.style.left = `${rectLeft}px`
        rect.style.width = `${rectWidth}px`
        rect.style.height = `${rectHeight}px`
        rect.style.display = 'block'

        onDragging({
          startX: rectLeft,
          startY: rectTop,
          endX: rectLeft + rectWidth,
          endY: rectTop + rectHeight,
        })
      }
    }

    const mouseupListener = (e: any) => {
      if (!isMouseDown) return
      isMouseDown = false
      rect.style.display = 'none'
    }

    const bind = () => {
      container.addEventListener('mousedown', mousedownListener)
      document.addEventListener('mousemove', mousemoveListener)
      document.addEventListener('mouseup', mouseupListener)
    }

    const unbind = () => {
      container.removeEventListener('mousedown', mousedownListener)
      document.removeEventListener('mousemove', mousemoveListener)
      document.removeEventListener('mouseup', mouseupListener)
    }

    bind()
    return unbind
  }, [rectRef, containerRef, containerInnerRef, onDragging])
}