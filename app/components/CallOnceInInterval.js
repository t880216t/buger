let isCalled = false
let timer

let CallOnceInInterval
/**
 * @param functionTobeCalled 被包装的方法
 * @param interval 时间间隔，可省略，默认600毫秒
 */
export default (CallOnceInInterval = (functionTobeCalled, interval = 3000) => {
  if (!isCalled) {
    isCalled = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      isCalled = false
    }, interval)
    return functionTobeCalled()
  }
})
