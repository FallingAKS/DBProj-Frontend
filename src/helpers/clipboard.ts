export function copyTextToClipboard(text: string): void {
  // 使用 navigator.clipboard API (现代浏览器)
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Text successfully copied to clipboard')
      },
      (err) => {
        console.error('Unable to copy text to clipboard', err)
      }
    )
  } else {
    // 为不支持 navigator.clipboard API 的浏览器使用旧方法
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      console.log('Text successfully copied to clipboard')
    } catch (err) {
      console.error('Unable to copy text to clipboard', err)
    }

    document.body.removeChild(textarea)
  }
}