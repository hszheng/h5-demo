function MyPromise(executor) {
  var self = this
  self.status = 'pending' // Promise初始状态为pending
  self.value = undefined // Promise的返回值
  self.reason = undefined // Promise的失败原因
  self.onResolvedCallbacks = [] // 成功回调函数数组
  self.onRejectedCallbacks = [] // 失败回调函数数组

  function resolve(value) {
    // resolve函数
    if (self.status === 'pending') {
      // 只有在Promise状态为pending时才能转为fulfilled状态
      self.status = 'fulfilled' // Promise状态变为fulfilled
      self.value = value // Promise的返回值为value
      self.onResolvedCallbacks.forEach(function (fn) {
        // 执行所有成功回调函数
        fn(self.value)
      })
    }
  }

  function reject(reason) {
    // reject函数
    if (self.status === 'pending') {
      // 只有在Promise状态为pending时才能转为rejected状态
      self.status = 'rejected' // Promise状态变为rejected
      self.reason = reason // Promise的失败原因为reason
      self.onRejectedCallbacks.forEach(function (fn) {
        // 执行所有失败回调函数
        fn(self.reason)
      })
    }
  }

  try {
    executor(resolve, reject) // 执行executor函数，传入resolve和reject函数
  } catch (e) {
    reject(e) // 如果executor函数发生错误，则将Promise状态变为rejected
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === 'function'
      ? onFulfilled
      : function (value) {
          return value
        } // 如果onFulfilled不是函数，则使用默认函数
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function (reason) {
          throw reason
        } // 如果onRejected不是函数，则使用默认函数
  var self = this
  var promise = new MyPromise(function (resolve, reject) {
    // 创建一个新的Promise实例
    if (self.status === 'fulfilled') {
      // 如果Promise状态为fulfilled
      setTimeout(function () {
        // 使用setTimeout将回调函数放到事件队列尾部执行，以等待当前代码块执行完毕
        try {
          var x = onFulfilled(self.value) // 执行onFulfilled回调函数
          resolvePromise(promise, x, resolve, reject) // 处理回调函数的返回值
        } catch (e) {
          reject(e) // 如果回调函数执行出错，则将新Promise实例的状态变为rejected
        }
      }, 0)
    } else if (self.status === 'rejected') {
      // 如果Promise状态为rejected
      setTimeout(function () {
        try {
          var x = onRejected(self.reason) // 执行onRejected回调函数
          resolvePromise(promise, x, resolve, reject) // 处理回调函数的返回值
        } catch (e) {
          reject(e) // 如果回调函数执行出错，则将新Promise实例的状态变为rejected
        }
      }, 0)
    } else {
      // 如果Promise状态为pending
      self.onResolvedCallbacks.push(function (value) {
        // 将回调函数加入成功回调函数数组
        setTimeout(function () {
          try {
            var x = onFulfilled(value) // 执行onFulfilled回调函数
            resolvePromise(promise, x, resolve, reject) // 处理回调函数的返回值
          } catch (e) {
            reject(e) // 如果回调函数执行出错，则将新Promise实例的状态变为rejected
          }
        }, 0)
      })
      self.onRejectedCallbacks.push(function (reason) {
        // 将回调函数加入失败回调函数数组
        setTimeout(function () {
          try {
            var x = onRejected(reason) // 执行onRejected回调函数
            resolvePromise(promise, x, resolve, reject) // 处理回调函数的返回值
          } catch (e) {
            reject(e) // 如果回调函数执行出错，则将新Promise实例的状态变为rejected
          }
        }, 0)
      })
    }
  })
  return promise // 返回新的Promise实例
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果返回值与Promise实例相等，则抛出异常，避免循环引用
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected for promise'))
  }
  // 标记是否已经调用过resolve或reject函数
  var called = false
  // 如果返回值是一个对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // 获取then方法
      var then = x.then
      // 如果then是一个函数
      if (typeof then === 'function') {
        // 将x作为then方法的this值，调用then方法，并传递两个回调函数
        then.call(
          x,
          function (y) {
            // 如果已经调用过resolve或reject函数，则直接返回
            if (called) return
            called = true
            // 递归调用resolvePromise函数，直到返回值是一个普通值
            resolvePromise(promise, y, resolve, reject)
          },
          function (e) {
            // 如果已经调用过resolve或reject函数，则直接返回
            if (called) return
            called = true
            // 如果调用then方法的返回值是一个rejected状态的Promise，则将新Promise实例的状态变为rejected
            reject(e)
          }
        )
      } else {
        // 如果then方法不是函数，则将新Promise实例的状态变为fulfilled，返回值为x
        resolve(x)
      }
    } catch (e) {
      // 如果调用then方法抛出异常，则将新Promise实例的状态变为rejected
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 如果返回值是一个普通值，则将新Promise实例的状态变为fulfilled，返回值为x
    resolve(x)
  }
}
