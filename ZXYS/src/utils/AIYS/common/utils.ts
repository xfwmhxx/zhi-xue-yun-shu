export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
): (...args: Parameters<F>) => void {
  let timeout: number

  return (...args: Parameters<F>): void => {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), waitFor)
  }
}

export const ROOT_CLASS_NAME = 'ai-root'
export const getRootElement = (): HTMLElement => {
  const root = document.querySelector(`.${ROOT_CLASS_NAME}`) as HTMLElement
  if (!root) {
    return document.body
  }
  return root
}

export const addRootClass = (element: HTMLElement) => {
  if (!element.classList.contains(ROOT_CLASS_NAME)) {
    element.classList.add(ROOT_CLASS_NAME)
  }
}

export const copyText = async (text: string) => {
  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error('navigator.clipboard is not supported')
    }
    await navigator.clipboard.writeText(text)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 如果不支持 Clipboard API 或不在安全上下文中，使用回退方法
    // if Clipboard API is not supported or not in a secure context, fallback to a backup method
    const textArea = document.createElement('textarea')
    textArea.value = text

    // 防止iOS设备上使用缩放
    // to prevent iOS devices from zooming
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('copy command failed')
      }
      // eslint-disable-next-line no-useless-catch
    } catch (err) {
      throw err
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isAndroidWeChatBrowser = () => {
  const ua = navigator.userAgent

  // 检查是否包含 Android 和 MicroMessenger
  // check if the user agent contains both Android and MicroMessenger
  return /Android/i.test(ua) && /MicroMessenger/i.test(ua)
}

interface ILongPressEventsProps {
  onStartCallback: (target: EventTarget | null) => void
  onEndCallback?: (target: EventTarget | null) => void
  ms?: number
}

type ILongPressStartMethod = (event: TouchEvent | MouseEvent) => number
type ILongPressEndMethod = (event: TouchEvent | MouseEvent) => void

interface RLongPressTouchEventsReturnTypes {
  onTouchStart: ILongPressStartMethod
  onTouchMove: ILongPressEndMethod
  onTouchEnd: ILongPressEndMethod
}
interface RLongPressMouseEventsReturnTypes {
  onMouseDown: ILongPressStartMethod
  onMouseUp: ILongPressEndMethod
  onMouseLeave: ILongPressEndMethod
}

type RLongPressEventsReturnTypes =
  | RLongPressTouchEventsReturnTypes
  | RLongPressMouseEventsReturnTypes

export const checkTouchSupport = () => 'ontouchstart' in window

export const longPressEvents = function ({
  onStartCallback,
  onEndCallback,
  ms = 500,
}: ILongPressEventsProps): RLongPressEventsReturnTypes {
  let timeout: number
  let target: EventTarget | null

  const start: ILongPressStartMethod = (event) => {
    if ((window.TouchEvent && event instanceof TouchEvent) || event instanceof MouseEvent)
      target = event.target
    return (timeout = window.setTimeout(() => onStartCallback(target), ms))
  }
  const stop: ILongPressEndMethod = (event) => {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    if (window.TouchEvent && event instanceof TouchEvent) target = event.target
    onEndCallback?.(target)
  }

  if (checkTouchSupport()) {
    return {
      onTouchStart: start,
      onTouchMove: stop,
      onTouchEnd: stop,
    }
  } else {
    return {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
    }
  }
}

export const lastOfArray = <T>(array: T[]): T | undefined => {
  if (array.length === 0) {
    return undefined
  }
  return array[array.length - 1]
}
