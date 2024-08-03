// const { parse } = require("@vue/compiler-sfc");
import { parse } from '@vue/compiler-sfc'
// const fs = require("fs");

// const vueFileContent = fs.readFileSync("src/components/HelloWorld.vue", "utf8");
// const parsedScf = parse(vueFileContent);

// fs.writeFileSync(
//   "./11111.json",
//   JSON.stringify(parsedScf.descriptor.template.ast)
// );

// console.log('---', parsedScf.descriptor.template.ast)

// const astSCF = parsedScf.descriptor.template.ast;

/**
 * 生成节点标签属性
 * @param {*} tag 
 * @param {*} props 
 * @returns 
 */
function handleProps(tag:any, props:any) {
  if (props.length === 0) {
    return `<${tag}>`;
  }
  let expression = '';
  for (let i = 0, len = props.length; i < len; i++) {
    expression += ' ';
    const item = props[i]
    const { type, name, value, exp, arg } = item;
    // type:7 指令
    if (type === 7) {
      // click事件
      if (name === 'on' && arg && arg.type === 4 && arg.content === 'click') {
        expression += `bindtap="${exp.content}"`;
      }
      if (name === 'if' && exp && exp.type === 4) {
        expression += `wx:if="{{${exp.content}}}"`;
      }
      if (name === 'else-if' && exp && exp.type === 4) {
        expression += `wx:elif="{{${exp.content}}}"`;
      }
      if (name === 'else') {
        expression += `wx:else`;
      }
      // for循环
      if (name === 'for' && exp && exp.type === 4) {
        const [ params, list ] = exp.content.split('in ');
        const paramsList = params.replace(/\(|\)/g, '').split(',');
        const [item, index] = paramsList;
        expression += `wx:for="{{${list}}}" wx:for-item="${item}" wx:for-index="${index}"`;
      } 
      // for循环，处理key
      if (name === 'bind' && arg && arg.type === 4 && arg.content === 'key') {
        expression += `wx:key="${exp.content}"`;
      }
    }
    // 其他属性，例如：class、style
    if (type === 6) {
      expression += `${name}="${value.content}"`;
    }
  }
  return `<${tag} ${expression}>`;
}

/**
 * vue标签AST转换成小程序wxml
 * @param {*} node 
 * @returns 
 */
function generateViews(node:any) {
  const { type, tag, props, content } = node;
  let startTag = '';
  let endTag = '';
  // 注释节点
  if (type === 3) {
    startTag = `<!-- ${content} -->` ;
    return { startTag, endTag };
  }
  // 普通文本节点
  if (type === 2) {
    startTag = content;
    return { startTag, endTag };
  }
  // 插值节点 例如：{{ title }}
  if (type === 5 && content.type === 4) {
    startTag = `{{ ${content.content} }}`;
    return { startTag, endTag };
  }
  switch (tag) {
    case 'div':
    case 'p':
    case 'span':
    case 'ul':
    case 'li':
    case 'em':
      startTag = handleProps('view', props);
      endTag = "</view>";
      break;
    case "template":
      startTag = handleProps('block', props);
      endTag = "</block>";
      break;
    case "img":
      startTag = handleProps('image', props);
      endTag = "</image>";
      break;
    default:
      startTag = handleProps(tag, props);
      endTag = `</${tag}>`;
  }
  return { startTag, endTag };
}

/**
 * 递归生成节点标签
 * @param {*} node 
 */
function mapNodes(node:any) {
  const children = node.children;
  if (children && children.length) {
    children.forEach((child:any) => {
      mapNodes(child);
    });
  }
  const { startTag, endTag } = generateViews(node);
  node.startTag = startTag;
  node.endTag = endTag;
}

/**
 * 生成wxml，递归处理，开闭标签
 * @param {*} node 
 * @returns 
 */
function generateWxml (node:any) {
  const { startTag, endTag, children } = node;
  let str = '';
  if (children && children.length) {
    str = children.reduce((pre:any, subChild:any) => {
      const childStr = generateWxml(subChild);
      return `${pre}${childStr}`;
    }, '');
  }
  return `${startTag}${str}${endTag}`;
}

// function init (astNode) {
//   mapNodes(astNode);
//   const wxml = generateWxml(astNode);
//   return wxml
// }

// const wxml = init(astSCF)

// fs.writeFileSync("./22222.wxml", wxml);

export default function(vueFileContent:string) {
    const parsedScf = parse(vueFileContent);
    const astSCF = parsedScf?.descriptor?.template?.ast;
    mapNodes(astSCF);
    const wxml = generateWxml(astSCF);
    return wxml
}