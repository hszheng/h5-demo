// const htmlparser2 = require("htmlparser2");
// const domSerializer = require("dom-serializer").default;
import * as htmlparser2 from "htmlparser2";

import domSerializer from 'dom-serializer'

const FAKE_ROOT = Symbol.for("fake-root");
const defaultConfig:any = {
  elementMap: {
    text: "span",
    view: "div",
    image: "img",
    block: "template",
  },
};

const parser = (doc:string) => {
  const handler = new htmlparser2.DomHandler();
  const parser = new htmlparser2.Parser(handler, {
    xmlMode: false,
    lowerCaseAttributeNames: false,
    recognizeSelfClosing: true,
    lowerCaseTags: false,
  });
  parser.end(doc);

  return {
    type: "tag",
    name: FAKE_ROOT,
    attribs: {},
    children: Array.isArray(handler.dom) ? handler.dom : [handler.dom],
  };
};

const transformAttr = (node: any) => {
  if (node.type !== "tag") return;
  const attribs = node.attribs;
  const newAttribs:any = {};
  if (!attribs || !Object.keys(attribs).length) return;

  for (const key in attribs) {
    if (!Object.hasOwnProperty.call(attribs, key)) {
      continue;
    }
    const value = String(attribs[key]);
    let newKey = key
      .replace(/^wx:/g, "v-")
      .replace(/^v-/g, ":")
      .replace(/^:if/g, "v-if")
      .replace(/^:for/g, "v-for")
      .replace(/^(bind):?/g, "@")
      .replace(/^catch:?(.*?)$/g, "@$1.capture")
      .replace(/tap$/g, "click");

    let isV = false;

    const len = value
      .split(/\{\{(.*?)\}\}/)
      .filter((item) => item.trim()).length;

    let newValue = value.replace(/\{\{(.*?)\}\}/g, (full, match) => {
      isV = true;
      if (len === 1) {
        return `${match}`;
      } else {
        return `' + (${match}) + '`;
      }
    });
    if (isV) {
      if (!/^(:|v-)/.test(newKey)) {
        newKey = ":" + newKey;
      }
    }

    if (isV && len > 1) {
      newValue = `'${newValue}'`;
    }

    newAttribs[newKey] = newValue;
  }

  const isForNode = Object.keys(newAttribs).find((key) => key === "v-for");

  if (isForNode) {
    const forValue = newAttribs["v-for"];
    const forKeyName = newAttribs[":key"];
    const forItemName = newAttribs["v-for-item"] || "item";

    delete newAttribs["v-for-item"];
    const forKey = [forItemName];
    if (forKeyName === "index") {
      forKey.unshift(forKeyName);
    } else {
      newAttribs[":key"] = [forItemName, forKeyName].join(".");
    }

    newAttribs["v-for"] = `(${forKey.join(",")}) in (${forValue})`;
    // template key 问题
    if (node.name === "template") {
      const key = newAttribs[":key"];
      delete newAttribs[":key"];
      node.children.map((node:any) => {
        if (node.type === "tag") {
          node.attribs[":key"] = key;
        }
      });
    }
  }
  node.attribs = newAttribs;
  return node;
};

const transformTag = (node: any) => {
  if (node.type !== "tag") return;
  const tag = node.name;
  node.name = defaultConfig.elementMap[tag] || tag;
  return node;
};

const transformTree = (tree: any):any => {
  if (!tree) return tree;

  if (Array.isArray(tree)) {
    return tree.map((node: any) => {
      return transformTree(node);
    });
  }
  tree.children = transformTree(tree.children);

  if (tree.tag === FAKE_ROOT) {
    return tree;
  }

  transformTag(tree);
  transformAttr(tree);

  return tree;
};

export default function(code: string) {
  const treeNode = parser(code);
  const tree = transformTree(treeNode);
  const output = domSerializer(tree.children, {});
  return output;
}
