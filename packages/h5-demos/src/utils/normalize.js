function normalize(str) {
  // 定义一个空的结果对象
  const result = { value: '' };
  // 定义一个栈，用于存储当前节点的父节点
  const stack = [result];
  // 遍历字符串中的每个字符
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '[') {
      // 如果当前字符是左括号，表明要开始一个新的子节点
      // 创建一个新的空节点，并将其作为当前节点的子节点
      const newNode = { value: '' };
      stack[stack.length - 1].children = [newNode];
      // 将新节点加入栈中，并将其设为当前节点
      stack.push(newNode);
    } else if (char === ']') {
      // 如果当前字符是右括号，表明要结束当前子节点
      // 将当前节点设为其父节点
      stack.pop();
    } else {
      // 如果当前字符是字母，表明当前节点是叶子节点
      // 将当前字符拼接到当前节点的值中
      stack[stack.length - 1].value += char;
    }
  }
  // 返回结果对象，根节点
  return result.children[0];
}