// 除了 new 和 Object.create，JavaScript 还可以通过以下几种方式实现继承：

// 原型链继承（Prototype Chain Inheritance）：基于原型链的继承方式，通过将子类的原型对象指向父类的实例对象来实现继承关系。这种继承方式的缺点是，父类的引用类型属性会被所有子类实例共享，容易造成属性污染和重复创建。示例代码如下：
function Parent() {
  this.name = 'Parent';
  this.colors = [ 'red', 'green', 'blue' ];
}

Parent.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

function Child() {
  this.name = 'Child';
}

Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

console.log(child1.name); // 'Child'
console.log(child1.colors); // [ 'red', 'green', 'blue' ]
child1.colors.push('yellow');
console.log(child2.colors); // [ 'red', 'green', 'blue', 'yellow' ]
child1.sayHello(); // 'Hello, I am Child'
// 借用构造函数（Constructor Borrowing）：通过在子类构造函数中调用父类构造函数来实现继承关系。这种继承方式的缺点是，父类原型对象上的方法无法被子类继承。示例代码如下：
function Parent(name) {
  this.name = name;
  this.colors = [ 'red', 'green', 'blue' ];
}

Parent.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

function Child(name) {
  Parent.call(this, name);
  this.age = 20;
}

const child = new Child('Child');

console.log(child.name); // 'Child'
console.log(child.colors); // [ 'red', 'green', 'blue' ]
child.sayHello(); // TypeError: child.sayHello is not a function
// 组合继承（Combination Inheritance）：结合原型链继承和借用构造函数的优点，通过在子类构造函数中调用父类构造函数，并将子类的原型对象指向父类的实例对象来实现继承关系。这种继承方式的缺点是，父类的构造函数会被调用两次，一次是在子类原型对象的创建过程中，另一次是在子类实例对象的创建过程中。示例代码如下：
function Parent(name) {
  this.name = name;
  this.colors = [ 'red', 'green', 'blue' ];
}

Parent.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child1 = new Child('Child1', 20);
const child2 = new Child('Child2', 25);

console.log(child1.name); // 'Child1'
console.log(child1.colors); // [ 'red', 'green', 'blue' ]
child1.colors.push('yellow');
console.log(child2.colors); // [ 'red', 'green', 'blue' ]
child1.sayHello(); // 'Hello, I am Child1'
// 寄生组合继承（Parasitic Combination Inheritance）：结合寄生式继承和组合继承的优点，通过创建一个临时的构造函数来实现继承关系，避免了父类构造函数被调用两次的问题。这种继承方式的缺点是，代码比较复杂，不够直观。示例代码如下：
function Parent(name) {
  this.name = name;
  this.colors = [ 'red', 'green', 'blue' ];
}

Parent.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 创建一个临时的构造函数，将其原型对象指向父类的原型对象
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

// 将子类的原型对象指向临时的构造函数的实例对象
inheritPrototype(Child, Parent);

const child1 = new Child('Child1', 20);
const child2 = new Child('Child2', 25);

console.log(child1.name); // 'Child1'
console.log(child1.colors); // [ 'red', 'green', 'blue' ]
child1.colors.push('yellow');
console.log(child2.colors); // [ 'red', 'green', 'blue' ]
child1.sayHello(); // 'Hello, I am Child1'
// 需要注意的是，以上几种继承方式都有其优缺点，应根据具体情况选择合适的继承方式。例如，原型链继承虽然简单，但容易造成多个对象之间的属性共享，不适合在实际开发中使用。而组合继承虽然解决了原型链继承的问题，但会导致父类构造函数被调用两次，影响性能。因此，在实际开发中，可以根据具体情况选择最适合的继承方式。