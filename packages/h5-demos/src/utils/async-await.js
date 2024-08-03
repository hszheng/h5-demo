// 定义一个 async 函数，它接收一个生成器函数作为参数，并返回一个新的函数
function async(fn) {
  return function () {
    // 创建一个生成器对象
    const gen = fn.apply(this, arguments);
    // 返回一个 Promise 对象，它将整个过程封装起来，并在 Promise 对象中处理异步操作的状态变化
    return new Promise((resolve, reject) => {
      // 定义一个递归函数 step，它用于执行生成器函数，并处理异步操作的状态变化
      function step(key, arg) {
        let result;
        try {
          // 执行生成器函数，获取返回值
          result = gen[key](arg);
        } catch (error) {
          // 如果发生错误，就将错误传递给 Promise 对象，并结束递归
          return reject(error);
        }
        // 将返回值解构为 value 和 done 两个属性
        const { value, done } = result;
        if (done) {
          // 如果生成器函数执行完成，就将返回值传递给 Promise 对象，并结束递归
          return resolve(value);
        } else {
          // 如果生成器函数还没有执行完成，就将返回值转换为 Promise 对象，并使用 then 方法等待 Promise 对象的状态变化
          return Promise.resolve(value).then(
            // 如果 Promise 对象的状态变为 resolved，就将返回值传递给下一步执行
            nextValue => step('next', nextValue),
            // 如果 Promise 对象的状态变为 rejected，就将错误传递给 Promise 对象，并结束递归
            error => step('throw', error)
          );
        }
      }
      // 开始执行生成器函数
      step('next');
    });
  };
}

// 定义一个 delay 函数，它返回一个 Promise 对象，在一定时间后将传入的时间作为返回值
function delay(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(time);
    }, time);
  });
}

// 定义一个 main 函数，它使用 async-await 的方式来处理异步操作，并打印异步操作的返回值
const main = async(function* () {
  // 使用 yield 关键字等待 Promise 对象的状态变化，并将返回值赋值给变量
  const result1 = yield delay(1000);
  console.log(result1); // 输出 1000
  const result2 = yield delay(2000);
  console.log(result2); // 输出 2000
});

// 调用 main 函数
main();