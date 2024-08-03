var Singleton = (function () {
  var instance;

  function createInstance() {
    // 在此处创建单例实例
    var object = new Object("I am the instance");
    return object;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

// 下面的两次调用将返回相同的实例
var instance1 = Singleton.getInstance();
var instance2 = Singleton.getInstance();

console.log(instance1 === instance2); // 输出 true