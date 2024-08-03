function logger(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`Entering '${name}' with arguments: ${JSON.stringify(args)}`);
    const result = originalMethod.apply(this, args);
    console.log(`Exiting '${name}' with result: ${JSON.stringify(result)}`);
    return result;
  }

  return descriptor;
}

class MyClass {
  @logger
  myMethod(a: number, b: number) {
    return a + b;
  }
}

const obj = new MyClass();
console.log(obj.myMethod(1, 2)); // 输出日志信息并返回 3