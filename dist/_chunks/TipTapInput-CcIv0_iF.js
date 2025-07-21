"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const react$1 = require("@tiptap/react");
const StarterKit = require("@tiptap/starter-kit");
const state = require("@tiptap/pm/state");
require("@tiptap/pm/view");
require("@tiptap/pm/keymap");
const transform = require("@tiptap/pm/transform");
const model = require("@tiptap/pm/model");
const commands = require("@tiptap/pm/commands");
const schemaList = require("@tiptap/pm/schema-list");
const styled = require("styled-components");
const extensionCodeBlockLowlight = require("@tiptap/extension-code-block-lowlight");
const lowlight$1 = require("lowlight");
const reactMaterialSymbols = require("react-material-symbols");
const TaskList = require("@tiptap/extension-task-list");
const TaskItem = require("@tiptap/extension-task-item");
const TextAlign = require("@tiptap/extension-text-align");
const Image = require("@tiptap/extension-image");
require("react-material-symbols/outlined");
const react = require("react");
const designSystem = require("@strapi/design-system");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const StarterKit__default = /* @__PURE__ */ _interopDefault(StarterKit);
const styled__default = /* @__PURE__ */ _interopDefault(styled);
const TaskList__default = /* @__PURE__ */ _interopDefault(TaskList);
const TaskItem__default = /* @__PURE__ */ _interopDefault(TaskItem);
const TextAlign__default = /* @__PURE__ */ _interopDefault(TextAlign);
const Image__default = /* @__PURE__ */ _interopDefault(Image);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
function createChainableState(config) {
  const { state: state2, transaction } = config;
  let { selection } = transaction;
  let { doc } = transaction;
  let { storedMarks } = transaction;
  return {
    ...state2,
    apply: state2.apply.bind(state2),
    applyTransaction: state2.applyTransaction.bind(state2),
    plugins: state2.plugins,
    schema: state2.schema,
    reconfigure: state2.reconfigure.bind(state2),
    toJSON: state2.toJSON.bind(state2),
    get storedMarks() {
      return storedMarks;
    },
    get selection() {
      return selection;
    },
    get doc() {
      return doc;
    },
    get tr() {
      selection = transaction.selection;
      doc = transaction.doc;
      storedMarks = transaction.storedMarks;
      return transaction;
    }
  };
}
var CommandManager = class {
  constructor(props) {
    this.editor = props.editor;
    this.rawCommands = this.editor.extensionManager.commands;
    this.customState = props.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands, editor, state: state2 } = this;
    const { view } = editor;
    const { tr } = state2;
    const props = this.buildProps(tr);
    return Object.fromEntries(
      Object.entries(rawCommands).map(([name, command2]) => {
        const method = (...args) => {
          const callback = command2(...args)(props);
          if (!tr.getMeta("preventDispatch") && !this.hasCustomState) {
            view.dispatch(tr);
          }
          return callback;
        };
        return [name, method];
      })
    );
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(startTr, shouldDispatch = true) {
    const { rawCommands, editor, state: state2 } = this;
    const { view } = editor;
    const callbacks = [];
    const hasStartTransaction = !!startTr;
    const tr = startTr || state2.tr;
    const run3 = () => {
      if (!hasStartTransaction && shouldDispatch && !tr.getMeta("preventDispatch") && !this.hasCustomState) {
        view.dispatch(tr);
      }
      return callbacks.every((callback) => callback === true);
    };
    const chain = {
      ...Object.fromEntries(
        Object.entries(rawCommands).map(([name, command2]) => {
          const chainedCommand = (...args) => {
            const props = this.buildProps(tr, shouldDispatch);
            const callback = command2(...args)(props);
            callbacks.push(callback);
            return chain;
          };
          return [name, chainedCommand];
        })
      ),
      run: run3
    };
    return chain;
  }
  createCan(startTr) {
    const { rawCommands, state: state2 } = this;
    const dispatch = false;
    const tr = startTr || state2.tr;
    const props = this.buildProps(tr, dispatch);
    const formattedCommands = Object.fromEntries(
      Object.entries(rawCommands).map(([name, command2]) => {
        return [name, (...args) => command2(...args)({ ...props, dispatch: void 0 })];
      })
    );
    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch)
    };
  }
  buildProps(tr, shouldDispatch = true) {
    const { rawCommands, editor, state: state2 } = this;
    const { view } = editor;
    const props = {
      tr,
      editor,
      view,
      state: createChainableState({
        state: state2,
        transaction: tr
      }),
      dispatch: shouldDispatch ? () => void 0 : void 0,
      chain: () => this.createChain(tr, shouldDispatch),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(
          Object.entries(rawCommands).map(([name, command2]) => {
            return [name, (...args) => command2(...args)(props)];
          })
        );
      }
    };
    return props;
  }
};
function combineTransactionSteps(oldDoc, transactions) {
  const transform$1 = new transform.Transform(oldDoc);
  transactions.forEach((transaction) => {
    transaction.steps.forEach((step) => {
      transform$1.step(step);
    });
  });
  return transform$1;
}
var removeWhitespaces = (node) => {
  const children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i];
    if (child.nodeType === 3 && child.nodeValue && /^(\n\s\s|\n)$/.test(child.nodeValue)) {
      node.removeChild(child);
    } else if (child.nodeType === 1) {
      removeWhitespaces(child);
    }
  }
  return node;
};
function elementFromString(value) {
  if (typeof window === "undefined") {
    throw new Error("[tiptap error]: there is no window object available, so this function cannot be used");
  }
  const wrappedValue = `<body>${value}</body>`;
  const html = new window.DOMParser().parseFromString(wrappedValue, "text/html").body;
  return removeWhitespaces(html);
}
function createNodeFromContent(content, schema, options) {
  if (content instanceof model.Node || content instanceof model.Fragment) {
    return content;
  }
  options = {
    slice: true,
    parseOptions: {},
    ...options
  };
  const isJSONContent = typeof content === "object" && content !== null;
  const isTextContent = typeof content === "string";
  if (isJSONContent) {
    try {
      const isArrayContent = Array.isArray(content) && content.length > 0;
      if (isArrayContent) {
        return model.Fragment.fromArray(content.map((item) => schema.nodeFromJSON(item)));
      }
      const node = schema.nodeFromJSON(content);
      if (options.errorOnInvalidContent) {
        node.check();
      }
      return node;
    } catch (error) {
      if (options.errorOnInvalidContent) {
        throw new Error("[tiptap error]: Invalid JSON content", { cause: error });
      }
      console.warn("[tiptap warn]: Invalid content.", "Passed value:", content, "Error:", error);
      return createNodeFromContent("", schema, options);
    }
  }
  if (isTextContent) {
    if (options.errorOnInvalidContent) {
      let hasInvalidContent = false;
      let invalidContent = "";
      const contentCheckSchema = new model.Schema({
        topNode: schema.spec.topNode,
        marks: schema.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: schema.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (e) => {
                  hasInvalidContent = true;
                  invalidContent = typeof e === "string" ? e : e.outerHTML;
                  return null;
                }
              }
            ]
          }
        })
      });
      if (options.slice) {
        model.DOMParser.fromSchema(contentCheckSchema).parseSlice(elementFromString(content), options.parseOptions);
      } else {
        model.DOMParser.fromSchema(contentCheckSchema).parse(elementFromString(content), options.parseOptions);
      }
      if (options.errorOnInvalidContent && hasInvalidContent) {
        throw new Error("[tiptap error]: Invalid HTML content", {
          cause: new Error(`Invalid element found: ${invalidContent}`)
        });
      }
    }
    const parser = model.DOMParser.fromSchema(schema);
    if (options.slice) {
      return parser.parseSlice(elementFromString(content), options.parseOptions).content;
    }
    return parser.parse(elementFromString(content), options.parseOptions);
  }
  return createNodeFromContent("", schema, options);
}
function createDocument(content, schema, parseOptions = {}, options = {}) {
  return createNodeFromContent(content, schema, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent
  });
}
function defaultBlockAt(match) {
  for (let i = 0; i < match.edgeCount; i += 1) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }
  return null;
}
function findParentNodeClosestToPos($pos, predicate) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node
      };
    }
  }
}
function findParentNode(predicate) {
  return (selection) => findParentNodeClosestToPos(selection.$from, predicate);
}
function getExtensionField(extension, field, context) {
  if (extension.config[field] === void 0 && extension.parent) {
    return getExtensionField(extension.parent, field, context);
  }
  if (typeof extension.config[field] === "function") {
    const value = extension.config[field].bind({
      ...context,
      parent: extension.parent ? getExtensionField(extension.parent, field, context) : null
    });
    return value;
  }
  return extension.config[field];
}
function isFunction(value) {
  return typeof value === "function";
}
function callOrReturn(value, context = void 0, ...props) {
  if (isFunction(value)) {
    if (context) {
      return value.bind(context)(...props);
    }
    return value(...props);
  }
  return value;
}
function splitExtensions(extensions) {
  const baseExtensions = extensions.filter((extension) => extension.type === "extension");
  const nodeExtensions = extensions.filter((extension) => extension.type === "node");
  const markExtensions = extensions.filter((extension) => extension.type === "mark");
  return {
    baseExtensions,
    nodeExtensions,
    markExtensions
  };
}
function mergeAttributes(...objects) {
  return objects.filter((item) => !!item).reduce((items, item) => {
    const mergedAttributes = { ...items };
    Object.entries(item).forEach(([key, value]) => {
      const exists = mergedAttributes[key];
      if (!exists) {
        mergedAttributes[key] = value;
        return;
      }
      if (key === "class") {
        const valueClasses = value ? String(value).split(" ") : [];
        const existingClasses = mergedAttributes[key] ? mergedAttributes[key].split(" ") : [];
        const insertClasses = valueClasses.filter((valueClass) => !existingClasses.includes(valueClass));
        mergedAttributes[key] = [...existingClasses, ...insertClasses].join(" ");
      } else if (key === "style") {
        const newStyles = value ? value.split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const existingStyles = mergedAttributes[key] ? mergedAttributes[key].split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const styleMap = /* @__PURE__ */ new Map();
        existingStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        newStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        mergedAttributes[key] = Array.from(styleMap.entries()).map(([property, val]) => `${property}: ${val}`).join("; ");
      } else {
        mergedAttributes[key] = value;
      }
    });
    return mergedAttributes;
  }, {});
}
function getTextBetween(startNode, range, options) {
  const { from, to } = range;
  const { blockSeparator = "\n\n", textSerializers = {} } = options || {};
  let text = "";
  startNode.nodesBetween(from, to, (node, pos, parent, index) => {
    var _a;
    if (node.isBlock && pos > from) {
      text += blockSeparator;
    }
    const textSerializer = textSerializers == null ? void 0 : textSerializers[node.type.name];
    if (textSerializer) {
      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range
        });
      }
      return false;
    }
    if (node.isText) {
      text += (_a = node == null ? void 0 : node.text) == null ? void 0 : _a.slice(Math.max(from, pos) - pos, to - pos);
    }
  });
  return text;
}
function getTextSerializersFromSchema(schema) {
  return Object.fromEntries(
    Object.entries(schema.nodes).filter(([, node]) => node.spec.toText).map(([name, node]) => [name, node.spec.toText])
  );
}
function getMarkType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.marks[nameOrType]) {
      throw Error(`There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.marks[nameOrType];
  }
  return nameOrType;
}
function getMarkAttributes(state2, typeOrName) {
  const type = getMarkType(typeOrName, state2.schema);
  const { from, to, empty } = state2.selection;
  const marks = [];
  if (empty) {
    if (state2.storedMarks) {
      marks.push(...state2.storedMarks);
    }
    marks.push(...state2.selection.$head.marks());
  } else {
    state2.doc.nodesBetween(from, to, (node) => {
      marks.push(...node.marks);
    });
  }
  const mark = marks.find((markItem) => markItem.type.name === type.name);
  if (!mark) {
    return {};
  }
  return { ...mark.attrs };
}
function getNodeType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.nodes[nameOrType]) {
      throw Error(`There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.nodes[nameOrType];
  }
  return nameOrType;
}
function getSchemaTypeNameByName(name, schema) {
  if (schema.nodes[name]) {
    return "node";
  }
  if (schema.marks[name]) {
    return "mark";
  }
  return null;
}
function removeDuplicates(array, by = JSON.stringify) {
  const seen = {};
  return array.filter((item) => {
    const key = by(item);
    return Object.prototype.hasOwnProperty.call(seen, key) ? false : seen[key] = true;
  });
}
function simplifyChangedRanges(changes) {
  const uniqueChanges = removeDuplicates(changes);
  return uniqueChanges.length === 1 ? uniqueChanges : uniqueChanges.filter((change, index) => {
    const rest = uniqueChanges.filter((_, i) => i !== index);
    return !rest.some((otherChange) => {
      return change.oldRange.from >= otherChange.oldRange.from && change.oldRange.to <= otherChange.oldRange.to && change.newRange.from >= otherChange.newRange.from && change.newRange.to <= otherChange.newRange.to;
    });
  });
}
function getChangedRanges(transform2) {
  const { mapping, steps } = transform2;
  const changes = [];
  mapping.maps.forEach((stepMap, index) => {
    const ranges = [];
    if (!stepMap.ranges.length) {
      const { from, to } = steps[index];
      if (from === void 0 || to === void 0) {
        return;
      }
      ranges.push({ from, to });
    } else {
      stepMap.forEach((from, to) => {
        ranges.push({ from, to });
      });
    }
    ranges.forEach(({ from, to }) => {
      const newStart = mapping.slice(index).map(from, -1);
      const newEnd = mapping.slice(index).map(to);
      const oldStart = mapping.invert().map(newStart, -1);
      const oldEnd = mapping.invert().map(newEnd);
      changes.push({
        oldRange: {
          from: oldStart,
          to: oldEnd
        },
        newRange: {
          from: newStart,
          to: newEnd
        }
      });
    });
  });
  return simplifyChangedRanges(changes);
}
function isRegExp(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}
function objectIncludes(object1, object2, options = { strict: true }) {
  const keys = Object.keys(object2);
  if (!keys.length) {
    return true;
  }
  return keys.every((key) => {
    if (options.strict) {
      return object2[key] === object1[key];
    }
    if (isRegExp(object2[key])) {
      return object2[key].test(object1[key]);
    }
    return object2[key] === object1[key];
  });
}
function findMarkInSet(marks, type, attributes = {}) {
  return marks.find((item) => {
    return item.type === type && objectIncludes(
      // Only check equality for the attributes that are provided
      Object.fromEntries(Object.keys(attributes).map((k) => [k, item.attrs[k]])),
      attributes
    );
  });
}
function isMarkInSet(marks, type, attributes = {}) {
  return !!findMarkInSet(marks, type, attributes);
}
function getMarkRange($pos, type, attributes) {
  var _a;
  if (!$pos || !type) {
    return;
  }
  let start = $pos.parent.childAfter($pos.parentOffset);
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    start = $pos.parent.childBefore($pos.parentOffset);
  }
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    return;
  }
  attributes = attributes || ((_a = start.node.marks[0]) == null ? void 0 : _a.attrs);
  const mark = findMarkInSet([...start.node.marks], type, attributes);
  if (!mark) {
    return;
  }
  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;
  while (startIndex > 0 && isMarkInSet([...$pos.parent.child(startIndex - 1).marks], type, attributes)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }
  while (endIndex < $pos.parent.childCount && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attributes)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }
  return {
    from: startPos,
    to: endPos
  };
}
function getMarksBetween(from, to, doc) {
  const marks = [];
  if (from === to) {
    doc.resolve(from).marks().forEach((mark) => {
      const $pos = doc.resolve(from);
      const range = getMarkRange($pos, mark.type);
      if (!range) {
        return;
      }
      marks.push({
        mark,
        ...range
      });
    });
  } else {
    doc.nodesBetween(from, to, (node, pos) => {
      if (!node || (node == null ? void 0 : node.nodeSize) === void 0) {
        return;
      }
      marks.push(
        ...node.marks.map((mark) => ({
          from: pos,
          to: pos + node.nodeSize,
          mark
        }))
      );
    });
  }
  return marks;
}
function getSplittedAttributes(extensionAttributes, typeName, attributes) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => {
      const extensionAttribute = extensionAttributes.find((item) => {
        return item.type === typeName && item.name === name;
      });
      if (!extensionAttribute) {
        return false;
      }
      return extensionAttribute.attribute.keepOnSplit;
    })
  );
}
function isMarkActive(state2, typeOrName, attributes = {}) {
  const { empty, ranges } = state2.selection;
  const type = typeOrName ? getMarkType(typeOrName, state2.schema) : null;
  if (empty) {
    return !!(state2.storedMarks || state2.selection.$from.marks()).filter((mark) => {
      if (!type) {
        return true;
      }
      return type.name === mark.type.name;
    }).find((mark) => objectIncludes(mark.attrs, attributes, { strict: false }));
  }
  let selectionRange = 0;
  const markRanges = [];
  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos;
    const to = $to.pos;
    state2.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length) {
        return;
      }
      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);
      const range2 = relativeTo - relativeFrom;
      selectionRange += range2;
      markRanges.push(
        ...node.marks.map((mark) => ({
          mark,
          from: relativeFrom,
          to: relativeTo
        }))
      );
    });
  });
  if (selectionRange === 0) {
    return false;
  }
  const matchedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return type.name === markRange.mark.type.name;
  }).filter((markRange) => objectIncludes(markRange.mark.attrs, attributes, { strict: false })).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const excludedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return markRange.mark.type !== type && markRange.mark.type.excludes(type);
  }).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;
  return range >= selectionRange;
}
function isNodeActive(state2, typeOrName, attributes = {}) {
  const { from, to, empty } = state2.selection;
  const type = typeOrName ? getNodeType(typeOrName, state2.schema) : null;
  const nodeRanges = [];
  state2.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      return;
    }
    const relativeFrom = Math.max(from, pos);
    const relativeTo = Math.min(to, pos + node.nodeSize);
    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo
    });
  });
  const selectionRange = to - from;
  const matchedNodeRanges = nodeRanges.filter((nodeRange) => {
    if (!type) {
      return true;
    }
    return type.name === nodeRange.node.type.name;
  }).filter((nodeRange) => objectIncludes(nodeRange.node.attrs, attributes, { strict: false }));
  if (empty) {
    return !!matchedNodeRanges.length;
  }
  const range = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0);
  return range >= selectionRange;
}
function isList(name, extensions) {
  const { nodeExtensions } = splitExtensions(extensions);
  const extension = nodeExtensions.find((item) => item.name === name);
  if (!extension) {
    return false;
  }
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage
  };
  const group = callOrReturn(getExtensionField(extension, "group", context));
  if (typeof group !== "string") {
    return false;
  }
  return group.split(" ").includes("list");
}
function isNodeEmpty(node, {
  checkChildren = true,
  ignoreWhitespace = false
} = {}) {
  var _a;
  if (ignoreWhitespace) {
    if (node.type.name === "hardBreak") {
      return true;
    }
    if (node.isText) {
      return /^\s*$/m.test((_a = node.text) != null ? _a : "");
    }
  }
  if (node.isText) {
    return !node.text;
  }
  if (node.isAtom || node.isLeaf) {
    return false;
  }
  if (node.content.childCount === 0) {
    return true;
  }
  if (checkChildren) {
    let isContentEmpty = true;
    node.content.forEach((childNode) => {
      if (isContentEmpty === false) {
        return;
      }
      if (!isNodeEmpty(childNode, { ignoreWhitespace, checkChildren })) {
        isContentEmpty = false;
      }
    });
    return isContentEmpty;
  }
  return false;
}
function isTextSelection(value) {
  return value instanceof state.TextSelection;
}
function minMax(value = 0, min = 0, max = 0) {
  return Math.min(Math.max(value, min), max);
}
function resolveFocusPosition(doc, position = null) {
  if (!position) {
    return null;
  }
  const selectionAtStart = state.Selection.atStart(doc);
  const selectionAtEnd = state.Selection.atEnd(doc);
  if (position === "start" || position === true) {
    return selectionAtStart;
  }
  if (position === "end") {
    return selectionAtEnd;
  }
  const minPos = selectionAtStart.from;
  const maxPos = selectionAtEnd.to;
  if (position === "all") {
    return state.TextSelection.create(doc, minMax(0, minPos, maxPos), minMax(doc.content.size, minPos, maxPos));
  }
  return state.TextSelection.create(doc, minMax(position, minPos, maxPos), minMax(position, minPos, maxPos));
}
function selectionToInsertionEnd(tr, startLen, bias) {
  const last = tr.steps.length - 1;
  if (last < startLen) {
    return;
  }
  const step = tr.steps[last];
  if (!(step instanceof transform.ReplaceStep || step instanceof transform.ReplaceAroundStep)) {
    return;
  }
  const map = tr.mapping.maps[last];
  let end = 0;
  map.forEach((_from, _to, _newFrom, newTo) => {
    if (end === 0) {
      end = newTo;
    }
  });
  tr.setSelection(state.Selection.near(tr.doc.resolve(end), bias));
}
var InputRule = class {
  constructor(config) {
    this.find = config.find;
    this.handler = config.handler;
  }
};
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
function isPlainObject(value) {
  if (getType(value) !== "Object") {
    return false;
  }
  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}
function mergeDeep(target, source) {
  const output = { ...target };
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isPlainObject(source[key]) && isPlainObject(target[key])) {
        output[key] = mergeDeep(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}
var Extendable = class {
  constructor(config = {}) {
    this.type = "extendable";
    this.parent = null;
    this.child = null;
    this.name = "";
    this.config = {
      name: this.name
    };
    this.config = {
      ...this.config,
      ...config
    };
    this.name = this.config.name;
  }
  get options() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addOptions", {
          name: this.name
        })
      ) || {}
    };
  }
  get storage() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addStorage", {
          name: this.name,
          options: this.options
        })
      ) || {}
    };
  }
  configure(options = {}) {
    const extension = this.extend({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options, options);
      }
    });
    extension.name = this.name;
    extension.parent = this.parent;
    return extension;
  }
  extend(extendedConfig = {}) {
    const extension = new this.constructor({ ...this.config, ...extendedConfig });
    extension.parent = this;
    this.child = extension;
    extension.name = "name" in extendedConfig ? extendedConfig.name : extension.parent.name;
    return extension;
  }
};
var Mark = class _Mark extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "mark";
  }
  /**
   * Create a new Mark instance
   * @param config - Mark configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Mark(resolvedConfig);
  }
  static handleExit({ editor, mark }) {
    const { tr } = editor.state;
    const currentPos = editor.state.selection.$from;
    const isAtEnd = currentPos.pos === currentPos.end();
    if (isAtEnd) {
      const currentMarks = currentPos.marks();
      const isInMark = !!currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (!isInMark) {
        return false;
      }
      const removeMark = currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (removeMark) {
        tr.removeStoredMark(removeMark);
      }
      tr.insertText(" ", currentPos.pos);
      editor.view.dispatch(tr);
      return true;
    }
    return false;
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
var PasteRule = class {
  constructor(config) {
    this.find = config.find;
    this.handler = config.handler;
  }
};
var extensions_exports = {};
__export(extensions_exports, {
  ClipboardTextSerializer: () => ClipboardTextSerializer,
  Commands: () => Commands,
  Delete: () => Delete,
  Drop: () => Drop,
  Editable: () => Editable,
  FocusEvents: () => FocusEvents,
  Keymap: () => Keymap,
  Paste: () => Paste,
  Tabindex: () => Tabindex,
  focusEventsPluginKey: () => focusEventsPluginKey
});
var Extension = class _Extension extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "extension";
  }
  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Extension(resolvedConfig);
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
var ClipboardTextSerializer = Extension.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new state.Plugin({
        key: new state.PluginKey("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this;
            const { state: state2, schema } = editor;
            const { doc, selection } = state2;
            const { ranges } = selection;
            const from = Math.min(...ranges.map((range2) => range2.$from.pos));
            const to = Math.max(...ranges.map((range2) => range2.$to.pos));
            const textSerializers = getTextSerializersFromSchema(schema);
            const range = { from, to };
            return getTextBetween(doc, range, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers
            });
          }
        }
      })
    ];
  }
});
var commands_exports = {};
__export(commands_exports, {
  blur: () => blur,
  clearContent: () => clearContent,
  clearNodes: () => clearNodes,
  command: () => command,
  createParagraphNear: () => createParagraphNear,
  cut: () => cut,
  deleteCurrentNode: () => deleteCurrentNode,
  deleteNode: () => deleteNode,
  deleteRange: () => deleteRange,
  deleteSelection: () => deleteSelection,
  enter: () => enter,
  exitCode: () => exitCode,
  extendMarkRange: () => extendMarkRange,
  first: () => first,
  focus: () => focus,
  forEach: () => forEach,
  insertContent: () => insertContent,
  insertContentAt: () => insertContentAt,
  joinBackward: () => joinBackward,
  joinDown: () => joinDown,
  joinForward: () => joinForward,
  joinItemBackward: () => joinItemBackward,
  joinItemForward: () => joinItemForward,
  joinTextblockBackward: () => joinTextblockBackward,
  joinTextblockForward: () => joinTextblockForward,
  joinUp: () => joinUp,
  keyboardShortcut: () => keyboardShortcut,
  lift: () => lift,
  liftEmptyBlock: () => liftEmptyBlock,
  liftListItem: () => liftListItem,
  newlineInCode: () => newlineInCode,
  resetAttributes: () => resetAttributes,
  scrollIntoView: () => scrollIntoView,
  selectAll: () => selectAll,
  selectNodeBackward: () => selectNodeBackward,
  selectNodeForward: () => selectNodeForward,
  selectParentNode: () => selectParentNode,
  selectTextblockEnd: () => selectTextblockEnd,
  selectTextblockStart: () => selectTextblockStart,
  setContent: () => setContent,
  setMark: () => setMark,
  setMeta: () => setMeta,
  setNode: () => setNode,
  setNodeSelection: () => setNodeSelection,
  setTextSelection: () => setTextSelection,
  sinkListItem: () => sinkListItem,
  splitBlock: () => splitBlock,
  splitListItem: () => splitListItem,
  toggleList: () => toggleList,
  toggleMark: () => toggleMark,
  toggleNode: () => toggleNode,
  toggleWrap: () => toggleWrap,
  undoInputRule: () => undoInputRule,
  unsetAllMarks: () => unsetAllMarks,
  unsetMark: () => unsetMark,
  updateAttributes: () => updateAttributes,
  wrapIn: () => wrapIn,
  wrapInList: () => wrapInList
});
var blur = () => ({ editor, view }) => {
  requestAnimationFrame(() => {
    var _a;
    if (!editor.isDestroyed) {
      view.dom.blur();
      (_a = window == null ? void 0 : window.getSelection()) == null ? void 0 : _a.removeAllRanges();
    }
  });
  return true;
};
var clearContent = (emitUpdate = true) => ({ commands: commands2 }) => {
  return commands2.setContent("", { emitUpdate });
};
var clearNodes = () => ({ state: state2, tr, dispatch }) => {
  const { selection } = tr;
  const { ranges } = selection;
  if (!dispatch) {
    return true;
  }
  ranges.forEach(({ $from, $to }) => {
    state2.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
      if (node.type.isText) {
        return;
      }
      const { doc, mapping } = tr;
      const $mappedFrom = doc.resolve(mapping.map(pos));
      const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
      const nodeRange = $mappedFrom.blockRange($mappedTo);
      if (!nodeRange) {
        return;
      }
      const targetLiftDepth = transform.liftTarget(nodeRange);
      if (node.type.isTextblock) {
        const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
        tr.setNodeMarkup(nodeRange.start, defaultType);
      }
      if (targetLiftDepth || targetLiftDepth === 0) {
        tr.lift(nodeRange, targetLiftDepth);
      }
    });
  });
  return true;
};
var command = (fn) => (props) => {
  return fn(props);
};
var createParagraphNear = () => ({ state: state2, dispatch }) => {
  return commands.createParagraphNear(state2, dispatch);
};
var cut = (originRange, targetPos) => ({ editor, tr }) => {
  const { state: state$1 } = editor;
  const contentSlice = state$1.doc.slice(originRange.from, originRange.to);
  tr.deleteRange(originRange.from, originRange.to);
  const newPos = tr.mapping.map(targetPos);
  tr.insert(newPos, contentSlice.content);
  tr.setSelection(new state.TextSelection(tr.doc.resolve(Math.max(newPos - 1, 0))));
  return true;
};
var deleteCurrentNode = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const currentNode = selection.$anchor.node();
  if (currentNode.content.size > 0) {
    return false;
  }
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === currentNode.type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
var deleteNode = (typeOrName) => ({ tr, state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
var deleteRange = (range) => ({ tr, dispatch }) => {
  const { from, to } = range;
  if (dispatch) {
    tr.delete(from, to);
  }
  return true;
};
var deleteSelection = () => ({ state: state2, dispatch }) => {
  return commands.deleteSelection(state2, dispatch);
};
var enter = () => ({ commands: commands2 }) => {
  return commands2.keyboardShortcut("Enter");
};
var exitCode = () => ({ state: state2, dispatch }) => {
  return commands.exitCode(state2, dispatch);
};
var extendMarkRange = (typeOrName, attributes = {}) => ({ tr, state: state$1, dispatch }) => {
  const type = getMarkType(typeOrName, state$1.schema);
  const { doc, selection } = tr;
  const { $from, from, to } = selection;
  if (dispatch) {
    const range = getMarkRange($from, type, attributes);
    if (range && range.from <= from && range.to >= to) {
      const newSelection = state.TextSelection.create(doc, range.from, range.to);
      tr.setSelection(newSelection);
    }
  }
  return true;
};
var first = (commands2) => (props) => {
  const items = typeof commands2 === "function" ? commands2(props) : commands2;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i](props)) {
      return true;
    }
  }
  return false;
};
function isAndroid() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function isiOS() {
  return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
var focus = (position = null, options = {}) => ({ editor, view, tr, dispatch }) => {
  options = {
    scrollIntoView: true,
    ...options
  };
  const delayedFocus = () => {
    if (isiOS() || isAndroid()) {
      view.dom.focus();
    }
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        view.focus();
        if (options == null ? void 0 : options.scrollIntoView) {
          editor.commands.scrollIntoView();
        }
      }
    });
  };
  if (view.hasFocus() && position === null || position === false) {
    return true;
  }
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    delayedFocus();
    return true;
  }
  const selection = resolveFocusPosition(tr.doc, position) || editor.state.selection;
  const isSameSelection = editor.state.selection.eq(selection);
  if (dispatch) {
    if (!isSameSelection) {
      tr.setSelection(selection);
    }
    if (isSameSelection && tr.storedMarks) {
      tr.setStoredMarks(tr.storedMarks);
    }
    delayedFocus();
  }
  return true;
};
var forEach = (items, fn) => (props) => {
  return items.every((item, index) => fn(item, { ...props, index }));
};
var insertContent = (value, options) => ({ tr, commands: commands2 }) => {
  return commands2.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options);
};
var isFragment = (nodeOrFragment) => {
  return !("type" in nodeOrFragment);
};
var insertContentAt = (position, value, options) => ({ tr, dispatch, editor }) => {
  var _a;
  if (dispatch) {
    options = {
      parseOptions: editor.options.parseOptions,
      updateSelection: true,
      applyInputRules: false,
      applyPasteRules: false,
      ...options
    };
    let content;
    const { selection } = editor.state;
    const emitContentError = (error) => {
      editor.emit("contentError", {
        editor,
        error,
        disableCollaboration: () => {
          if ("collaboration" in editor.storage && typeof editor.storage.collaboration === "object" && editor.storage.collaboration) {
            editor.storage.collaboration.isDisabled = true;
          }
        }
      });
    };
    const parseOptions = {
      preserveWhitespace: "full",
      ...options.parseOptions
    };
    if (!options.errorOnInvalidContent && !editor.options.enableContentCheck && editor.options.emitContentError) {
      try {
        createNodeFromContent(value, editor.schema, {
          parseOptions,
          errorOnInvalidContent: true
        });
      } catch (e) {
        emitContentError(e);
      }
    }
    try {
      content = createNodeFromContent(value, editor.schema, {
        parseOptions,
        errorOnInvalidContent: (_a = options.errorOnInvalidContent) != null ? _a : editor.options.enableContentCheck
      });
    } catch (e) {
      emitContentError(e);
      return false;
    }
    let { from, to } = typeof position === "number" ? { from: position, to: position } : { from: position.from, to: position.to };
    let isOnlyTextContent = true;
    let isOnlyBlockContent = true;
    const nodes = isFragment(content) ? content : [content];
    nodes.forEach((node) => {
      node.check();
      isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false;
      isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false;
    });
    if (from === to && isOnlyBlockContent) {
      const { parent } = tr.doc.resolve(from);
      const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount;
      if (isEmptyTextBlock) {
        from -= 1;
        to += 1;
      }
    }
    let newContent;
    if (isOnlyTextContent) {
      if (Array.isArray(value)) {
        newContent = value.map((v) => v.text || "").join("");
      } else if (value instanceof model.Fragment) {
        let text = "";
        value.forEach((node) => {
          if (node.text) {
            text += node.text;
          }
        });
        newContent = text;
      } else if (typeof value === "object" && !!value && !!value.text) {
        newContent = value.text;
      } else {
        newContent = value;
      }
      tr.insertText(newContent, from, to);
    } else {
      newContent = content;
      const fromSelectionAtStart = selection.$from.parentOffset === 0;
      const isTextSelection2 = selection.$from.node().isText || selection.$from.node().isTextblock;
      const hasContent = selection.$from.node().content.size > 0;
      if (fromSelectionAtStart && isTextSelection2 && hasContent) {
        from = Math.max(0, from - 1);
      }
      tr.replaceWith(from, to, newContent);
    }
    if (options.updateSelection) {
      selectionToInsertionEnd(tr, tr.steps.length - 1, -1);
    }
    if (options.applyInputRules) {
      tr.setMeta("applyInputRules", { from, text: newContent });
    }
    if (options.applyPasteRules) {
      tr.setMeta("applyPasteRules", { from, text: newContent });
    }
  }
  return true;
};
var joinUp = () => ({ state: state2, dispatch }) => {
  return commands.joinUp(state2, dispatch);
};
var joinDown = () => ({ state: state2, dispatch }) => {
  return commands.joinDown(state2, dispatch);
};
var joinBackward = () => ({ state: state2, dispatch }) => {
  return commands.joinBackward(state2, dispatch);
};
var joinForward = () => ({ state: state2, dispatch }) => {
  return commands.joinForward(state2, dispatch);
};
var joinItemBackward = () => ({ state: state2, dispatch, tr }) => {
  try {
    const point = transform.joinPoint(state2.doc, state2.selection.$from.pos, -1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinItemForward = () => ({ state: state2, dispatch, tr }) => {
  try {
    const point = transform.joinPoint(state2.doc, state2.selection.$from.pos, 1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinTextblockBackward = () => ({ state: state2, dispatch }) => {
  return commands.joinTextblockBackward(state2, dispatch);
};
var joinTextblockForward = () => ({ state: state2, dispatch }) => {
  return commands.joinTextblockForward(state2, dispatch);
};
function isMacOS() {
  return typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
}
function normalizeKeyName(name) {
  const parts = name.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result === "Space") {
    result = " ";
  }
  let alt;
  let ctrl;
  let shift;
  let meta;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) {
      meta = true;
    } else if (/^a(lt)?$/i.test(mod)) {
      alt = true;
    } else if (/^(c|ctrl|control)$/i.test(mod)) {
      ctrl = true;
    } else if (/^s(hift)?$/i.test(mod)) {
      shift = true;
    } else if (/^mod$/i.test(mod)) {
      if (isiOS() || isMacOS()) {
        meta = true;
      } else {
        ctrl = true;
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${mod}`);
    }
  }
  if (alt) {
    result = `Alt-${result}`;
  }
  if (ctrl) {
    result = `Ctrl-${result}`;
  }
  if (meta) {
    result = `Meta-${result}`;
  }
  if (shift) {
    result = `Shift-${result}`;
  }
  return result;
}
var keyboardShortcut = (name) => ({ editor, view, tr, dispatch }) => {
  const keys = normalizeKeyName(name).split(/-(?!$)/);
  const key = keys.find((item) => !["Alt", "Ctrl", "Meta", "Shift"].includes(item));
  const event = new KeyboardEvent("keydown", {
    key: key === "Space" ? " " : key,
    altKey: keys.includes("Alt"),
    ctrlKey: keys.includes("Ctrl"),
    metaKey: keys.includes("Meta"),
    shiftKey: keys.includes("Shift"),
    bubbles: true,
    cancelable: true
  });
  const capturedTransaction = editor.captureTransaction(() => {
    view.someProp("handleKeyDown", (f) => f(view, event));
  });
  capturedTransaction == null ? void 0 : capturedTransaction.steps.forEach((step) => {
    const newStep = step.map(tr.mapping);
    if (newStep && dispatch) {
      tr.maybeStep(newStep);
    }
  });
  return true;
};
var lift = (typeOrName, attributes = {}) => ({ state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  const isActive2 = isNodeActive(state2, type, attributes);
  if (!isActive2) {
    return false;
  }
  return commands.lift(state2, dispatch);
};
var liftEmptyBlock = () => ({ state: state2, dispatch }) => {
  return commands.liftEmptyBlock(state2, dispatch);
};
var liftListItem = (typeOrName) => ({ state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  return schemaList.liftListItem(type)(state2, dispatch);
};
var newlineInCode = () => ({ state: state2, dispatch }) => {
  return commands.newlineInCode(state2, dispatch);
};
function deleteProps(obj, propOrProps) {
  const props = typeof propOrProps === "string" ? [propOrProps] : propOrProps;
  return Object.keys(obj).reduce((newObj, prop) => {
    if (!props.includes(prop)) {
      newObj[prop] = obj[prop];
    }
    return newObj;
  }, {});
}
var resetAttributes = (typeOrName, attributes) => ({ tr, state: state2, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state2.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state2.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state2.schema);
  }
  if (dispatch) {
    tr.selection.ranges.forEach((range) => {
      state2.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
        if (nodeType && nodeType === node.type) {
          tr.setNodeMarkup(pos, void 0, deleteProps(node.attrs, attributes));
        }
        if (markType && node.marks.length) {
          node.marks.forEach((mark) => {
            if (markType === mark.type) {
              tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attributes)));
            }
          });
        }
      });
    });
  }
  return true;
};
var scrollIntoView = () => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView();
  }
  return true;
};
var selectAll = () => ({ tr, dispatch }) => {
  if (dispatch) {
    const selection = new state.AllSelection(tr.doc);
    tr.setSelection(selection);
  }
  return true;
};
var selectNodeBackward = () => ({ state: state2, dispatch }) => {
  return commands.selectNodeBackward(state2, dispatch);
};
var selectNodeForward = () => ({ state: state2, dispatch }) => {
  return commands.selectNodeForward(state2, dispatch);
};
var selectParentNode = () => ({ state: state2, dispatch }) => {
  return commands.selectParentNode(state2, dispatch);
};
var selectTextblockEnd = () => ({ state: state2, dispatch }) => {
  return commands.selectTextblockEnd(state2, dispatch);
};
var selectTextblockStart = () => ({ state: state2, dispatch }) => {
  return commands.selectTextblockStart(state2, dispatch);
};
var setContent = (content, { errorOnInvalidContent, emitUpdate = true, parseOptions = {} } = {}) => ({ editor, tr, dispatch, commands: commands2 }) => {
  const { doc } = tr;
  if (parseOptions.preserveWhitespace !== "full") {
    const document2 = createDocument(content, editor.schema, parseOptions, {
      errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
    });
    if (dispatch) {
      tr.replaceWith(0, doc.content.size, document2).setMeta("preventUpdate", !emitUpdate);
    }
    return true;
  }
  if (dispatch) {
    tr.setMeta("preventUpdate", !emitUpdate);
  }
  return commands2.insertContentAt({ from: 0, to: doc.content.size }, content, {
    parseOptions,
    errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
  });
};
function canSetMark(state2, tr, newMarkType) {
  var _a;
  const { selection } = tr;
  let cursor = null;
  if (isTextSelection(selection)) {
    cursor = selection.$cursor;
  }
  if (cursor) {
    const currentMarks = (_a = state2.storedMarks) != null ? _a : cursor.marks();
    return !!newMarkType.isInSet(currentMarks) || !currentMarks.some((mark) => mark.type.excludes(newMarkType));
  }
  const { ranges } = selection;
  return ranges.some(({ $from, $to }) => {
    let someNodeSupportsMark = $from.depth === 0 ? state2.doc.inlineContent && state2.doc.type.allowsMarkType(newMarkType) : false;
    state2.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
      if (someNodeSupportsMark) {
        return false;
      }
      if (node.isInline) {
        const parentAllowsMarkType = !parent || parent.type.allowsMarkType(newMarkType);
        const currentMarksAllowMarkType = !!newMarkType.isInSet(node.marks) || !node.marks.some((otherMark) => otherMark.type.excludes(newMarkType));
        someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType;
      }
      return !someNodeSupportsMark;
    });
    return someNodeSupportsMark;
  });
}
var setMark = (typeOrName, attributes = {}) => ({ tr, state: state2, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  const type = getMarkType(typeOrName, state2.schema);
  if (dispatch) {
    if (empty) {
      const oldAttributes = getMarkAttributes(state2, type);
      tr.addStoredMark(
        type.create({
          ...oldAttributes,
          ...attributes
        })
      );
    } else {
      ranges.forEach((range) => {
        const from = range.$from.pos;
        const to = range.$to.pos;
        state2.doc.nodesBetween(from, to, (node, pos) => {
          const trimmedFrom = Math.max(pos, from);
          const trimmedTo = Math.min(pos + node.nodeSize, to);
          const someHasMark = node.marks.find((mark) => mark.type === type);
          if (someHasMark) {
            node.marks.forEach((mark) => {
              if (type === mark.type) {
                tr.addMark(
                  trimmedFrom,
                  trimmedTo,
                  type.create({
                    ...mark.attrs,
                    ...attributes
                  })
                );
              }
            });
          } else {
            tr.addMark(trimmedFrom, trimmedTo, type.create(attributes));
          }
        });
      });
    }
  }
  return canSetMark(state2, tr, type);
};
var setMeta = (key, value) => ({ tr }) => {
  tr.setMeta(key, value);
  return true;
};
var setNode = (typeOrName, attributes = {}) => ({ state: state2, dispatch, chain }) => {
  const type = getNodeType(typeOrName, state2.schema);
  let attributesToCopy;
  if (state2.selection.$anchor.sameParent(state2.selection.$head)) {
    attributesToCopy = state2.selection.$anchor.parent.attrs;
  }
  if (!type.isTextblock) {
    console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.');
    return false;
  }
  return chain().command(({ commands: commands$1 }) => {
    const canSetBlock = commands.setBlockType(type, { ...attributesToCopy, ...attributes })(state2);
    if (canSetBlock) {
      return true;
    }
    return commands$1.clearNodes();
  }).command(({ state: updatedState }) => {
    return commands.setBlockType(type, { ...attributesToCopy, ...attributes })(updatedState, dispatch);
  }).run();
};
var setNodeSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const from = minMax(position, 0, doc.content.size);
    const selection = state.NodeSelection.create(doc, from);
    tr.setSelection(selection);
  }
  return true;
};
var setTextSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const { from, to } = typeof position === "number" ? { from: position, to: position } : position;
    const minPos = state.TextSelection.atStart(doc).from;
    const maxPos = state.TextSelection.atEnd(doc).to;
    const resolvedFrom = minMax(from, minPos, maxPos);
    const resolvedEnd = minMax(to, minPos, maxPos);
    const selection = state.TextSelection.create(doc, resolvedFrom, resolvedEnd);
    tr.setSelection(selection);
  }
  return true;
};
var sinkListItem = (typeOrName) => ({ state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  return schemaList.sinkListItem(type)(state2, dispatch);
};
function ensureMarks(state2, splittableMarks) {
  const marks = state2.storedMarks || state2.selection.$to.parentOffset && state2.selection.$from.marks();
  if (marks) {
    const filteredMarks = marks.filter((mark) => splittableMarks == null ? void 0 : splittableMarks.includes(mark.type.name));
    state2.tr.ensureMarks(filteredMarks);
  }
}
var splitBlock = ({ keepMarks = true } = {}) => ({ tr, state: state$1, dispatch, editor }) => {
  const { selection, doc } = tr;
  const { $from, $to } = selection;
  const extensionAttributes = editor.extensionManager.attributes;
  const newAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
  if (selection instanceof state.NodeSelection && selection.node.isBlock) {
    if (!$from.parentOffset || !transform.canSplit(doc, $from.pos)) {
      return false;
    }
    if (dispatch) {
      if (keepMarks) {
        ensureMarks(state$1, editor.extensionManager.splittableMarks);
      }
      tr.split($from.pos).scrollIntoView();
    }
    return true;
  }
  if (!$from.parent.isBlock) {
    return false;
  }
  const atEnd = $to.parentOffset === $to.parent.content.size;
  const deflt = $from.depth === 0 ? void 0 : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
  let types = atEnd && deflt ? [
    {
      type: deflt,
      attrs: newAttributes
    }
  ] : void 0;
  let can = transform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
  if (!types && !can && transform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : void 0)) {
    can = true;
    types = deflt ? [
      {
        type: deflt,
        attrs: newAttributes
      }
    ] : void 0;
  }
  if (dispatch) {
    if (can) {
      if (selection instanceof state.TextSelection) {
        tr.deleteSelection();
      }
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (deflt && !atEnd && !$from.parentOffset && $from.parent.type !== deflt) {
        const first2 = tr.mapping.map($from.before());
        const $first = tr.doc.resolve(first2);
        if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
        }
      }
    }
    if (keepMarks) {
      ensureMarks(state$1, editor.extensionManager.splittableMarks);
    }
    tr.scrollIntoView();
  }
  return can;
};
var splitListItem = (typeOrName, overrideAttrs = {}) => ({ tr, state: state$1, dispatch, editor }) => {
  var _a;
  const type = getNodeType(typeOrName, state$1.schema);
  const { $from, $to } = state$1.selection;
  const node = state$1.selection.node;
  if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) {
    return false;
  }
  const grandParent = $from.node(-1);
  if (grandParent.type !== type) {
    return false;
  }
  const extensionAttributes = editor.extensionManager.attributes;
  if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
    if ($from.depth === 2 || $from.node(-3).type !== type || $from.index(-2) !== $from.node(-2).childCount - 1) {
      return false;
    }
    if (dispatch) {
      let wrap = model.Fragment.empty;
      const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
      for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d -= 1) {
        wrap = model.Fragment.from($from.node(d).copy(wrap));
      }
      const depthAfter = (
        // eslint-disable-next-line no-nested-ternary
        $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3
      );
      const newNextTypeAttributes2 = {
        ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
        ...overrideAttrs
      };
      const nextType2 = ((_a = type.contentMatch.defaultType) == null ? void 0 : _a.createAndFill(newNextTypeAttributes2)) || void 0;
      wrap = wrap.append(model.Fragment.from(type.createAndFill(null, nextType2) || void 0));
      const start = $from.before($from.depth - (depthBefore - 1));
      tr.replace(start, $from.after(-depthAfter), new model.Slice(wrap, 4 - depthBefore, 0));
      let sel = -1;
      tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
        if (sel > -1) {
          return false;
        }
        if (n.isTextblock && n.content.size === 0) {
          sel = pos + 1;
        }
      });
      if (sel > -1) {
        tr.setSelection(state.TextSelection.near(tr.doc.resolve(sel)));
      }
      tr.scrollIntoView();
    }
    return true;
  }
  const nextType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
  const newTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, grandParent.type.name, grandParent.attrs),
    ...overrideAttrs
  };
  const newNextTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
    ...overrideAttrs
  };
  tr.delete($from.pos, $to.pos);
  const types = nextType ? [
    { type, attrs: newTypeAttributes },
    { type: nextType, attrs: newNextTypeAttributes }
  ] : [{ type, attrs: newTypeAttributes }];
  if (!transform.canSplit(tr.doc, $from.pos, 2)) {
    return false;
  }
  if (dispatch) {
    const { selection, storedMarks } = state$1;
    const { splittableMarks } = editor.extensionManager;
    const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
    tr.split($from.pos, 2, types).scrollIntoView();
    if (!marks || !dispatch) {
      return true;
    }
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
  }
  return true;
};
var joinListBackwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth);
  if (before === void 0) {
    return true;
  }
  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards = list.node.type === (nodeBefore == null ? void 0 : nodeBefore.type) && transform.canJoin(tr.doc, list.pos);
  if (!canJoinBackwards) {
    return true;
  }
  tr.join(list.pos);
  return true;
};
var joinListForwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const after = tr.doc.resolve(list.start).after(list.depth);
  if (after === void 0) {
    return true;
  }
  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards = list.node.type === (nodeAfter == null ? void 0 : nodeAfter.type) && transform.canJoin(tr.doc, after);
  if (!canJoinForwards) {
    return true;
  }
  tr.join(after);
  return true;
};
var toggleList = (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) => ({ editor, tr, state: state2, dispatch, chain, commands: commands2, can }) => {
  const { extensions, splittableMarks } = editor.extensionManager;
  const listType = getNodeType(listTypeOrName, state2.schema);
  const itemType = getNodeType(itemTypeOrName, state2.schema);
  const { selection, storedMarks } = state2;
  const { $from, $to } = selection;
  const range = $from.blockRange($to);
  const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
  if (!range) {
    return false;
  }
  const parentList = findParentNode((node) => isList(node.type.name, extensions))(selection);
  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    if (parentList.node.type === listType) {
      return commands2.liftListItem(itemType);
    }
    if (isList(parentList.node.type.name, extensions) && listType.validContent(parentList.node.content) && dispatch) {
      return chain().command(() => {
        tr.setNodeMarkup(parentList.pos, listType);
        return true;
      }).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
    }
  }
  if (!keepMarks || !marks || !dispatch) {
    return chain().command(() => {
      const canWrapInList = can().wrapInList(listType, attributes);
      if (canWrapInList) {
        return true;
      }
      return commands2.clearNodes();
    }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
  }
  return chain().command(() => {
    const canWrapInList = can().wrapInList(listType, attributes);
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
    if (canWrapInList) {
      return true;
    }
    return commands2.clearNodes();
  }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
};
var toggleMark = (typeOrName, attributes = {}, options = {}) => ({ state: state2, commands: commands2 }) => {
  const { extendEmptyMarkRange = false } = options;
  const type = getMarkType(typeOrName, state2.schema);
  const isActive2 = isMarkActive(state2, type, attributes);
  if (isActive2) {
    return commands2.unsetMark(type, { extendEmptyMarkRange });
  }
  return commands2.setMark(type, attributes);
};
var toggleNode = (typeOrName, toggleTypeOrName, attributes = {}) => ({ state: state2, commands: commands2 }) => {
  const type = getNodeType(typeOrName, state2.schema);
  const toggleType = getNodeType(toggleTypeOrName, state2.schema);
  const isActive2 = isNodeActive(state2, type, attributes);
  let attributesToCopy;
  if (state2.selection.$anchor.sameParent(state2.selection.$head)) {
    attributesToCopy = state2.selection.$anchor.parent.attrs;
  }
  if (isActive2) {
    return commands2.setNode(toggleType, attributesToCopy);
  }
  return commands2.setNode(type, { ...attributesToCopy, ...attributes });
};
var toggleWrap = (typeOrName, attributes = {}) => ({ state: state2, commands: commands2 }) => {
  const type = getNodeType(typeOrName, state2.schema);
  const isActive2 = isNodeActive(state2, type, attributes);
  if (isActive2) {
    return commands2.lift(type);
  }
  return commands2.wrapIn(type, attributes);
};
var undoInputRule = () => ({ state: state2, dispatch }) => {
  const plugins = state2.plugins;
  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = plugins[i];
    let undoable;
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state2))) {
      if (dispatch) {
        const tr = state2.tr;
        const toUndo = undoable.transform;
        for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
        }
        if (undoable.text) {
          const marks = tr.doc.resolve(undoable.from).marks();
          tr.replaceWith(undoable.from, undoable.to, state2.schema.text(undoable.text, marks));
        } else {
          tr.delete(undoable.from, undoable.to);
        }
      }
      return true;
    }
  }
  return false;
};
var unsetAllMarks = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  if (empty) {
    return true;
  }
  if (dispatch) {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos);
    });
  }
  return true;
};
var unsetMark = (typeOrName, options = {}) => ({ tr, state: state2, dispatch }) => {
  var _a;
  const { extendEmptyMarkRange = false } = options;
  const { selection } = tr;
  const type = getMarkType(typeOrName, state2.schema);
  const { $from, empty, ranges } = selection;
  if (!dispatch) {
    return true;
  }
  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection;
    const attrs = (_a = $from.marks().find((mark) => mark.type === type)) == null ? void 0 : _a.attrs;
    const range = getMarkRange($from, type, attrs);
    if (range) {
      from = range.from;
      to = range.to;
    }
    tr.removeMark(from, to, type);
  } else {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos, type);
    });
  }
  tr.removeStoredMark(type);
  return true;
};
var updateAttributes = (typeOrName, attributes = {}) => ({ tr, state: state2, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state2.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state2.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state2.schema);
  }
  if (dispatch) {
    tr.selection.ranges.forEach((range) => {
      const from = range.$from.pos;
      const to = range.$to.pos;
      let lastPos;
      let lastNode;
      let trimmedFrom;
      let trimmedTo;
      if (tr.selection.empty) {
        state2.doc.nodesBetween(from, to, (node, pos) => {
          if (nodeType && nodeType === node.type) {
            trimmedFrom = Math.max(pos, from);
            trimmedTo = Math.min(pos + node.nodeSize, to);
            lastPos = pos;
            lastNode = node;
          }
        });
      } else {
        state2.doc.nodesBetween(from, to, (node, pos) => {
          if (pos < from && nodeType && nodeType === node.type) {
            trimmedFrom = Math.max(pos, from);
            trimmedTo = Math.min(pos + node.nodeSize, to);
            lastPos = pos;
            lastNode = node;
          }
          if (pos >= from && pos <= to) {
            if (nodeType && nodeType === node.type) {
              tr.setNodeMarkup(pos, void 0, {
                ...node.attrs,
                ...attributes
              });
            }
            if (markType && node.marks.length) {
              node.marks.forEach((mark) => {
                if (markType === mark.type) {
                  const trimmedFrom2 = Math.max(pos, from);
                  const trimmedTo2 = Math.min(pos + node.nodeSize, to);
                  tr.addMark(
                    trimmedFrom2,
                    trimmedTo2,
                    markType.create({
                      ...mark.attrs,
                      ...attributes
                    })
                  );
                }
              });
            }
          }
        });
      }
      if (lastNode) {
        if (lastPos !== void 0) {
          tr.setNodeMarkup(lastPos, void 0, {
            ...lastNode.attrs,
            ...attributes
          });
        }
        if (markType && lastNode.marks.length) {
          lastNode.marks.forEach((mark) => {
            if (markType === mark.type) {
              tr.addMark(
                trimmedFrom,
                trimmedTo,
                markType.create({
                  ...mark.attrs,
                  ...attributes
                })
              );
            }
          });
        }
      }
    });
  }
  return true;
};
var wrapIn = (typeOrName, attributes = {}) => ({ state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  return commands.wrapIn(type, attributes)(state2, dispatch);
};
var wrapInList = (typeOrName, attributes = {}) => ({ state: state2, dispatch }) => {
  const type = getNodeType(typeOrName, state2.schema);
  return schemaList.wrapInList(type, attributes)(state2, dispatch);
};
var Commands = Extension.create({
  name: "commands",
  addCommands() {
    return {
      ...commands_exports
    };
  }
});
var Delete = Extension.create({
  name: "delete",
  onUpdate({ transaction, appendedTransactions }) {
    var _a, _b, _c;
    const callback = () => {
      var _a2, _b2, _c2, _d;
      if ((_d = (_c2 = (_b2 = (_a2 = this.editor.options.coreExtensionOptions) == null ? void 0 : _a2.delete) == null ? void 0 : _b2.filterTransaction) == null ? void 0 : _c2.call(_b2, transaction)) != null ? _d : transaction.getMeta("y-sync$")) {
        return;
      }
      const nextTransaction = combineTransactionSteps(transaction.before, [transaction, ...appendedTransactions]);
      const changes = getChangedRanges(nextTransaction);
      changes.forEach((change) => {
        if (nextTransaction.mapping.mapResult(change.oldRange.from).deletedAfter && nextTransaction.mapping.mapResult(change.oldRange.to).deletedBefore) {
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, from) => {
            const to = from + node.nodeSize - 2;
            const isFullyWithinRange = change.oldRange.from <= from && to <= change.oldRange.to;
            this.editor.emit("delete", {
              type: "node",
              node,
              from,
              to,
              newFrom: nextTransaction.mapping.map(from),
              newTo: nextTransaction.mapping.map(to),
              deletedRange: change.oldRange,
              newRange: change.newRange,
              partial: !isFullyWithinRange,
              editor: this.editor,
              transaction,
              combinedTransform: nextTransaction
            });
          });
        }
      });
      const mapping = nextTransaction.mapping;
      nextTransaction.steps.forEach((step, index) => {
        var _a3, _b3;
        if (step instanceof transform.RemoveMarkStep) {
          const newStart = mapping.slice(index).map(step.from, -1);
          const newEnd = mapping.slice(index).map(step.to);
          const oldStart = mapping.invert().map(newStart, -1);
          const oldEnd = mapping.invert().map(newEnd);
          const foundBeforeMark = (_a3 = nextTransaction.doc.nodeAt(newStart - 1)) == null ? void 0 : _a3.marks.some((mark) => mark.eq(step.mark));
          const foundAfterMark = (_b3 = nextTransaction.doc.nodeAt(newEnd)) == null ? void 0 : _b3.marks.some((mark) => mark.eq(step.mark));
          this.editor.emit("delete", {
            type: "mark",
            mark: step.mark,
            from: step.from,
            to: step.to,
            deletedRange: {
              from: oldStart,
              to: oldEnd
            },
            newRange: {
              from: newStart,
              to: newEnd
            },
            partial: Boolean(foundAfterMark || foundBeforeMark),
            editor: this.editor,
            transaction,
            combinedTransform: nextTransaction
          });
        }
      });
    };
    if ((_c = (_b = (_a = this.editor.options.coreExtensionOptions) == null ? void 0 : _a.delete) == null ? void 0 : _b.async) != null ? _c : true) {
      setTimeout(callback, 0);
    } else {
      callback();
    }
  }
});
var Drop = Extension.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new state.Plugin({
        key: new state.PluginKey("tiptapDrop"),
        props: {
          handleDrop: (_, e, slice, moved) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice,
              moved
            });
          }
        }
      })
    ];
  }
});
var Editable = Extension.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new state.Plugin({
        key: new state.PluginKey("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
var focusEventsPluginKey = new state.PluginKey("focusEvents");
var FocusEvents = Extension.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new state.Plugin({
        key: focusEventsPluginKey,
        props: {
          handleDOMEvents: {
            focus: (view, event) => {
              editor.isFocused = true;
              const transaction = editor.state.tr.setMeta("focus", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            },
            blur: (view, event) => {
              editor.isFocused = false;
              const transaction = editor.state.tr.setMeta("blur", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            }
          }
        }
      })
    ];
  }
});
var Keymap = Extension.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const handleBackspace = () => this.editor.commands.first(({ commands: commands2 }) => [
      () => commands2.undoInputRule(),
      // maybe convert first text block node to default node
      () => commands2.command(({ tr }) => {
        const { selection, doc } = tr;
        const { empty, $anchor } = selection;
        const { pos, parent } = $anchor;
        const $parentPos = $anchor.parent.isTextblock && pos > 0 ? tr.doc.resolve(pos - 1) : $anchor;
        const parentIsIsolating = $parentPos.parent.type.spec.isolating;
        const parentPos = $anchor.pos - $anchor.parentOffset;
        const isAtStart = parentIsIsolating && $parentPos.parent.childCount === 1 ? parentPos === $anchor.pos : state.Selection.atStart(doc).from === pos;
        if (!empty || !parent.type.isTextblock || parent.textContent.length || !isAtStart || isAtStart && $anchor.parent.type.name === "paragraph") {
          return false;
        }
        return commands2.clearNodes();
      }),
      () => commands2.deleteSelection(),
      () => commands2.joinBackward(),
      () => commands2.selectNodeBackward()
    ]);
    const handleDelete = () => this.editor.commands.first(({ commands: commands2 }) => [
      () => commands2.deleteSelection(),
      () => commands2.deleteCurrentNode(),
      () => commands2.joinForward(),
      () => commands2.selectNodeForward()
    ]);
    const handleEnter = () => this.editor.commands.first(({ commands: commands2 }) => [
      () => commands2.newlineInCode(),
      () => commands2.createParagraphNear(),
      () => commands2.liftEmptyBlock(),
      () => commands2.splitBlock()
    ]);
    const baseKeymap = {
      Enter: handleEnter,
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: handleBackspace,
      "Mod-Backspace": handleBackspace,
      "Shift-Backspace": handleBackspace,
      Delete: handleDelete,
      "Mod-Delete": handleDelete,
      "Mod-a": () => this.editor.commands.selectAll()
    };
    const pcKeymap = {
      ...baseKeymap
    };
    const macKeymap = {
      ...baseKeymap,
      "Ctrl-h": handleBackspace,
      "Alt-Backspace": handleBackspace,
      "Ctrl-d": handleDelete,
      "Ctrl-Alt-Backspace": handleDelete,
      "Alt-Delete": handleDelete,
      "Alt-d": handleDelete,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    if (isiOS() || isMacOS()) {
      return macKeymap;
    }
    return pcKeymap;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new state.Plugin({
        key: new state.PluginKey("clearDocument"),
        appendTransaction: (transactions, oldState, newState) => {
          if (transactions.some((tr2) => tr2.getMeta("composition"))) {
            return;
          }
          const docChanges = transactions.some((transaction) => transaction.docChanged) && !oldState.doc.eq(newState.doc);
          const ignoreTr = transactions.some((transaction) => transaction.getMeta("preventClearDocument"));
          if (!docChanges || ignoreTr) {
            return;
          }
          const { empty, from, to } = oldState.selection;
          const allFrom = state.Selection.atStart(oldState.doc).from;
          const allEnd = state.Selection.atEnd(oldState.doc).to;
          const allWasSelected = from === allFrom && to === allEnd;
          if (empty || !allWasSelected) {
            return;
          }
          const isEmpty = isNodeEmpty(newState.doc);
          if (!isEmpty) {
            return;
          }
          const tr = newState.tr;
          const state$1 = createChainableState({
            state: newState,
            transaction: tr
          });
          const { commands: commands2 } = new CommandManager({
            editor: this.editor,
            state: state$1
          });
          commands2.clearNodes();
          if (!tr.steps.length) {
            return;
          }
          return tr;
        }
      })
    ];
  }
});
var Paste = Extension.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new state.Plugin({
        key: new state.PluginKey("tiptapPaste"),
        props: {
          handlePaste: (_view, e, slice) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice
            });
          }
        }
      })
    ];
  }
});
var Tabindex = Extension.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new state.Plugin({
        key: new state.PluginKey("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
function markInputRule(config) {
  return new InputRule({
    find: config.find,
    handler: ({ state: state2, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, void 0, match);
      if (attributes === false || attributes === null) {
        return null;
      }
      const { tr } = state2;
      const captureGroup = match[match.length - 1];
      const fullMatch = match[0];
      if (captureGroup) {
        const startSpaces = fullMatch.search(/\S/);
        const textStart = range.from + fullMatch.indexOf(captureGroup);
        const textEnd = textStart + captureGroup.length;
        const excludedMarks = getMarksBetween(range.from, range.to, state2.doc).filter((item) => {
          const excluded = item.mark.type.excluded;
          return excluded.find((type) => type === config.type && type !== item.mark.type);
        }).filter((item) => item.to > textStart);
        if (excludedMarks.length) {
          return null;
        }
        if (textEnd < range.to) {
          tr.delete(textEnd, range.to);
        }
        if (textStart > range.from) {
          tr.delete(range.from + startSpaces, textStart);
        }
        const markEnd = range.from + startSpaces + captureGroup.length;
        tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}));
        tr.removeStoredMark(config.type);
      }
    }
  });
}
function textblockTypeInputRule(config) {
  return new InputRule({
    find: config.find,
    handler: ({ state: state2, range, match }) => {
      const $start = state2.doc.resolve(range.from);
      const attributes = callOrReturn(config.getAttributes, void 0, match) || {};
      if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), config.type)) {
        return null;
      }
      state2.tr.delete(range.from, range.to).setBlockType(range.from, range.from, config.type, attributes);
    }
  });
}
var Node3 = class _Node extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "node";
  }
  /**
   * Create a new Node instance
   * @param config - Node configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Node(resolvedConfig);
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
function markPasteRule(config) {
  return new PasteRule({
    find: config.find,
    handler: ({ state: state2, range, match, pasteEvent }) => {
      const attributes = callOrReturn(config.getAttributes, void 0, match, pasteEvent);
      if (attributes === false || attributes === null) {
        return null;
      }
      const { tr } = state2;
      const captureGroup = match[match.length - 1];
      const fullMatch = match[0];
      let markEnd = range.to;
      if (captureGroup) {
        const startSpaces = fullMatch.search(/\S/);
        const textStart = range.from + fullMatch.indexOf(captureGroup);
        const textEnd = textStart + captureGroup.length;
        const excludedMarks = getMarksBetween(range.from, range.to, state2.doc).filter((item) => {
          const excluded = item.mark.type.excluded;
          return excluded.find((type) => type === config.type && type !== item.mark.type);
        }).filter((item) => item.to > textStart);
        if (excludedMarks.length) {
          return null;
        }
        if (textEnd < range.to) {
          tr.delete(textEnd, range.to);
        }
        if (textStart > range.from) {
          tr.delete(range.from + startSpaces, textStart);
        }
        markEnd = range.from + startSpaces + captureGroup.length;
        tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}));
        tr.removeStoredMark(config.type);
      }
    }
  });
}
var Underline = Mark.create({
  name: "underline",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "u"
      },
      {
        style: "text-decoration",
        consuming: false,
        getAttrs: (style) => style.includes("underline") ? {} : false
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["u", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setUnderline: () => ({ commands: commands2 }) => {
        return commands2.setMark(this.name);
      },
      toggleUnderline: () => ({ commands: commands2 }) => {
        return commands2.toggleMark(this.name);
      },
      unsetUnderline: () => ({ commands: commands2 }) => {
        return commands2.unsetMark(this.name);
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-u": () => this.editor.commands.toggleUnderline(),
      "Mod-U": () => this.editor.commands.toggleUnderline()
    };
  }
});
var index_default$3 = Underline;
var inputRegex$1 = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/;
var pasteRegex$1 = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g;
var Strike = Mark.create({
  name: "strike",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "s"
      },
      {
        tag: "del"
      },
      {
        tag: "strike"
      },
      {
        style: "text-decoration",
        consuming: false,
        getAttrs: (style) => style.includes("line-through") ? {} : false
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["s", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setStrike: () => ({ commands: commands2 }) => {
        return commands2.setMark(this.name);
      },
      toggleStrike: () => ({ commands: commands2 }) => {
        return commands2.toggleMark(this.name);
      },
      unsetStrike: () => ({ commands: commands2 }) => {
        return commands2.unsetMark(this.name);
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.toggleStrike()
    };
  },
  addInputRules() {
    return [
      markInputRule({
        find: inputRegex$1,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex$1,
        type: this.type
      })
    ];
  }
});
var index_default$2 = Strike;
var inputRegex = /(^|[^`])`([^`]+)`(?!`)/;
var pasteRegex = /(^|[^`])`([^`]+)`(?!`)/g;
var Code = Mark.create({
  name: "code",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  excludes: "_",
  code: true,
  exitable: true,
  parseHTML() {
    return [{ tag: "code" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["code", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setCode: () => ({ commands: commands2 }) => {
        return commands2.setMark(this.name);
      },
      toggleCode: () => ({ commands: commands2 }) => {
        return commands2.toggleMark(this.name);
      },
      unsetCode: () => ({ commands: commands2 }) => {
        return commands2.unsetMark(this.name);
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-e": () => this.editor.commands.toggleCode()
    };
  },
  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type
      })
    ];
  }
});
var index_default$1 = Code;
var Heading = Node3.create({
  name: "heading",
  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {}
    };
  },
  content: "inline*",
  group: "block",
  defining: true,
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false
      }
    };
  },
  parseHTML() {
    return this.options.levels.map((level) => ({
      tag: `h${level}`,
      attrs: { level }
    }));
  },
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];
    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setHeading: (attributes) => ({ commands: commands2 }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }
        return commands2.setNode(this.name, attributes);
      },
      toggleHeading: (attributes) => ({ commands: commands2 }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }
        return commands2.toggleNode(this.name, "paragraph", attributes);
      }
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level })
        }
      }),
      {}
    );
  },
  addInputRules() {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{${Math.min(...this.options.levels)},${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level
        }
      });
    });
  }
});
var index_default = Heading;
const EditorWrapper = styled__default.default.div`
    ${({ $hasError = false, $isExpanded = false, theme }) => styled.css`
        height: ${$isExpanded ? "100%" : "auto"};
        border-radius: ${theme.borderRadius};
        outline: none;
        box-shadow: none;
        transition-property: border-color, box-shadow, fill;
        transition-duration: 0.2s;
        border: unset;
        background: #19191a;
        overflow: hidden;
        border-radius: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        width: 100%;
        border: 1px solid ${$isExpanded ? theme.colors.neutral200 : theme.colors.primary600};

        > div:first-child {
        }

        > div:last-child {
            width: 100%;
        }

        .ProseMirror {
            min-height: 550px;
            margin-bottom: 20px;
            padding: 20px;
            padding-bottom: 0;
            border-radius: ${theme.borderRadius};
            outline: none;
            font-size: 1.5rem;
            line-height: 1.6;
            background: inherit;
            box-shadow: 0 1px 2px rgba(16, 30, 54, 0.04);
            font-weight: 300;
            max-height: 550px;
            overflow-y: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            * {
                width: 100%;
                max-width: 640px;
            }

            h1 {
                font-size: 4rem;
                font-weight: 600;
            }

            h2 {
                font-size: 3rem;
                font-weight: 600;
            }

            h3 {
                font-size: 2rem;
                font-weight: 600;
            }

            h4 {
                font-size: 1.8rem;
                font-weight: 600;
            }

            h5 {
                font-size: 1.65rem;
                font-weight: 600;
            }

            h6 {
                font-size: 1.5rem;
                font-weight: 600;
            }

            p {
                font-size: 1.5rem;
            }

            blockquote {
                border-left: 4px solid ${theme.colors.primary600};
                margin: 1.5em 10px;
                padding: 0.5em 1em;
                color: ${theme.colors.neutral800};
                background: ${theme.colors.neutral100};
                font-style: italic;
            }

            ul, ol {
                margin: 0.5rem 0 0.5rem 1.5rem;
                padding-left: 1.5rem;
            }

            ul {
                list-style-type: disc;
            }

            ol {
                list-style-type: decimal;
            }

            li {
                margin-bottom: 0.25rem;
            }

            ul[data-type="taskList"] {
                padding: 0;
                margin: 0;

                li {
                    padding: 0;
                    margin: 0;
                    margin-bottom: 0.25rem;
                    display: flex;
                    flex-wrap: nowrap;
                    gap: 10px;
                }
            }

            strong {
                font-weight: 900;
            }

            > code, p > code, pre {
                background-color: #e8e8fd0d;
                font-family: 'Courier New', Courier, monospace;
                border-radius: 5px;
                border: 1px solid #eeeef61c;
                font-size: 1.4rem;
            }

            > code, p > code {
                padding: 5px 10px;
                margin: 5px;
            }

            pre {
                color: #fff;
                margin: 1.5rem 0;
                padding: 15px;
                overflow-x: auto;
                min-height: max-content;
                max-height: max-content;

                code {
                    background: none;
                    color: inherit;
                    font-size: inherit;
                    padding: 0;
                }
            }

            code {
                .hljs-comment,
                .hljs-quote {
                    color: #6a9955;
                }

                .hljs-variable,
                .hljs-template-variable,
                .hljs-attribute,
                .hljs-tag,
                .hljs-name,
                .hljs-regexp,
                .hljs-link,
                .hljs-selector-id,
                .hljs-selector-class {
                    color: #9cdcfe;
                }

                .hljs-number,
                .hljs-meta,
                .hljs-built_in,
                .hljs-builtin-name,
                .hljs-literal,
                .hljs-type,
                .hljs-params {
                    color: #b5cea8;
                }

                .hljs-string,
                .hljs-symbol,
                .hljs-bullet {
                    color: #ce9178;
                }

                .hljs-title,
                .hljs-section {
                    color: #dcdcaa;
                }

                .hljs-keyword,
                .hljs-selector-tag {
                    color: #569cd6;
                }

                .hljs-emphasis {
                    font-style: italic;
                }

                .hljs-strong {
                    font-weight: 700;
                }
            }
        }
    `}
`;
const Toolbar = styled__default.default.div`
    display: flex;
    flex-wrap: wrap;
    background-color: #111111;
    padding: 10px;
    gap: 5px;
    margin: 15px;
    margin-bottom: 0;
    border-radius: 15px;

    & > .toolbar-group {
        display: flex;
        gap: 5px;

        & > {
            .toolbar-vr {
                width: 10px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                > div {
                    width: 1px;
                    height: 50%;
                    background-color: #ffffff15;
                }
            }

            .toolbar-select, button {
                font-size: 15px;
                border-radius: 10px;
                background-color: #19191a;
            }

            .toolbar-select {
                color: ${({ theme }) => theme.colors.neutral800};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                width: 120px;

                &:focus {
                    outline: none;
                    border-color: ${({ theme }) => theme.colors.primary600};
                }

                select {
                    padding: 5px 10px;
                    padding-right: 40px;
                    background-color: transparent;
                    border: none;
                    color: inherit;
                    font-size: inherit;
                    -webkit-appearance: none;
                    appearance: none;
                    -moz-appearance: none;
                    width: 100%;
                    height: 100%;

                    &:focus {
                        outline: none;
                    }
                }

                span {
                    position: absolute;
                    right: 5px;
                    pointer-events: none;
                    touch-action: none;
                }
            }

            button {
                padding: 5px;
                width: unset;
                height: unset;
                min-width: unset;
                min-height: unset;
                display: flex;
                justify-content: center;
                align-content: center;
                border: none;
                box-shadow: none;
                aspect-ratio: 1 / 1;

                &:hover {
                    background: ${({ theme }) => theme.colors.primary050};
                }

                > span {
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    line-height: 0;
                }
            }
        }
    }
`;
const Button = styled__default.default(designSystem.Button)`
    color: ${({ $active, theme }) => $active ? theme.colors.primary700 : theme.colors.neutral800};
    opacity: ${({ $disabled, theme }) => $disabled ? 0.2 : 1};
    pointer-events: ${({ $disabled }) => $disabled ? "none" : "auto"};
    touch-action: ${({ $disabled }) => $disabled ? "none" : "auto"};
`;
const lowlight = lowlight$1.createLowlight(lowlight$1.common);
const Tiptap = ({
  name,
  error,
  description,
  onChange,
  value,
  intlLabel,
  attribute
}) => {
  const theme = styled.useTheme();
  const [editorValue, setEditorValue] = react.useState(value || "<p></p>");
  react.useEffect(() => {
    onChange({
      target: {
        name,
        value: editorValue,
        type: attribute.type
      }
    });
  }, [editorValue]);
  const [showImageModal, setShowImageModal] = react.useState(false);
  const editor = react$1.useEditor({
    extensions: [
      StarterKit__default.default.configure({
        heading: false,
        // Disable default heading in StarterKit
        codeBlock: false,
        // Disable default codeBlock
        code: false
      }),
      index_default.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      index_default$3,
      index_default$2,
      index_default$1,
      extensionCodeBlockLowlight.CodeBlockLowlight.configure({
        languageClassPrefix: "language-",
        defaultLanguage: "javascript",
        lowlight
      }),
      TaskList__default.default,
      TaskItem__default.default,
      TextAlign__default.default.configure({ types: ["heading", "paragraph"] }),
      Image__default.default
      // Add image extension
    ],
    content: editorValue,
    onUpdate: ({ editor: editor2 }) => {
      setEditorValue(editor2.getHTML());
    }
  });
  const editorState = react$1.useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold"),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive("italic"),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive("strike"),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive("code"),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isHeading4: ctx.editor.isActive("heading", { level: 4 }),
        isHeading5: ctx.editor.isActive("heading", { level: 5 }),
        isHeading6: ctx.editor.isActive("heading", { level: 6 }),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        isTaskList: ctx.editor.isActive("taskList"),
        isTextAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run()
      };
    }
  });
  const headingOptions = [
    { level: 0, label: "Normal" },
    { level: 1, label: "Title 1" },
    { level: 2, label: "Title 2" },
    { level: 3, label: "Title 3" },
    { level: 4, label: "Title 4" },
    { level: 5, label: "Title 5" },
    { level: 6, label: "Title 6" }
  ];
  const [align, setAlign] = react.useState("left");
  react.useEffect(() => {
    if (editor) {
      if (editor.isActive({ textAlign: "right" })) setAlign("right");
      else if (editor.isActive({ textAlign: "justify" })) setAlign("justify");
      else if (editor.isActive({ textAlign: "center" })) setAlign("center");
      else setAlign("left");
    }
  }, [editor && editor.state.selection]);
  const toolbarGroups = [
    [
      {
        type: "select",
        value: () => align,
        onChange: (e) => {
          const alignValue = e.target.value;
          setAlign(alignValue);
          editor.chain().focus().setTextAlign(alignValue).run();
        },
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" }
        ],
        icon: "format_align_left"
      }
    ],
    [
      {
        command: () => editor.chain().focus().toggleBold().run(),
        icon: "format_bold",
        isActive: (state2) => state2.isBold,
        canUse: (state2) => state2.canBold
      },
      {
        command: () => editor.chain().focus().toggleItalic().run(),
        icon: "format_italic",
        isActive: (state2) => state2.isItalic,
        canUse: (state2) => state2.canItalic
      },
      {
        command: () => editor.chain().focus().toggleUnderline().run(),
        icon: "format_underlined",
        isActive: () => editor.isActive("underline")
      },
      {
        command: () => editor.chain().focus().toggleStrike().run(),
        icon: "strikethrough_s",
        isActive: (state2) => state2.isStrike,
        canUse: (state2) => state2.canStrike
      }
    ],
    [
      {
        type: "vr"
      }
    ],
    [
      {
        command: () => editor.chain().focus().toggleBulletList().run(),
        icon: "format_list_bulleted",
        isActive: () => editor.isActive("bulletList")
      },
      {
        command: () => editor.chain().focus().toggleOrderedList().run(),
        icon: "format_list_numbered",
        isActive: () => editor.isActive("orderedList")
      },
      {
        command: () => editor.chain().focus().toggleTaskList().run(),
        icon: "checklist",
        isActive: () => editor.isActive("taskList")
      }
    ],
    [
      {
        type: "vr"
      }
    ],
    [
      {
        command: () => editor.chain().focus().toggleBlockquote().run(),
        icon: "format_quote",
        isActive: () => editor.isActive("blockquote")
      },
      {
        command: () => editor.chain().focus().toggleCode().run(),
        icon: "code",
        isActive: (state2) => state2.isCode,
        canUse: (state2) => state2.canCode
      },
      {
        command: () => editor.chain().focus().toggleCodeBlock().run(),
        icon: "code_blocks",
        isActive: (state2) => state2.isCodeBlock
      }
    ],
    [
      {
        type: "vr"
      }
    ],
    [
      {
        command: () => editor.chain().focus().undo().run(),
        icon: "undo",
        isActive: () => editor.can().undo(),
        isDisabled: () => !editor.can().undo()
      },
      {
        command: () => editor.chain().focus().redo().run(),
        icon: "redo",
        isActive: () => editor.can().redo(),
        isDisabled: () => !editor.can().redo()
      }
    ],
    [
      {
        command: () => setShowImageModal(true),
        icon: "image",
        isActive: () => false,
        label: "Insert Image"
      }
    ]
  ];
  const handleKeyDown = (event) => {
    if (!editor) return;
    if (event.key === "Tab") {
      event.preventDefault();
      if (editor.isActive("codeBlock") && editor.commands.insertContent) {
        editor.commands.insertContent("	");
      } else if (editor.can().sinkListItem("listItem")) {
        editor.commands.sinkListItem("listItem");
      } else {
        editor.commands.insertContent("	");
      }
    }
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      if (editor.can().liftListItem("listItem")) {
        editor.commands.liftListItem("listItem");
      }
    }
  };
  const handleImageSelect = (imageUrl) => {
    if (editor && imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageModal(false);
    }
  };
  if (!editor) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs(EditorWrapper, { theme, children: [
    /* @__PURE__ */ jsxRuntime.jsx(Toolbar, { children: toolbarGroups.map((group, groupIdx) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolbar-group", children: [
      groupIdx === 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolbar-select", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: headingOptions.find((h) => editor.isActive("heading", { level: h.level }))?.level || "",
            onChange: (e) => {
              const level = Number(e.target.value);
              if (level) editor.chain().focus().setHeading({ level }).run();
              else editor.chain().focus().setParagraph().run();
            },
            style: { paddingRight: 30 },
            children: headingOptions.map((opt) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt.level, children: opt.label }, opt.level))
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          reactMaterialSymbols.MaterialSymbol,
          {
            icon: "arrow_drop_down",
            size: 24
          }
        )
      ] }),
      group.map((btn, idx) => {
        switch (btn.type) {
          case "select":
            return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolbar-select", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "select",
                {
                  value: btn.value(),
                  onChange: btn.onChange,
                  style: { paddingRight: 30 },
                  children: btn.options.map((opt) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt.value, children: opt.label }, opt.value))
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                reactMaterialSymbols.MaterialSymbol,
                {
                  icon: "arrow_drop_down",
                  size: 24
                }
              )
            ] }, btn.icon + idx);
          case "vr":
            return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "toolbar-vr", children: /* @__PURE__ */ jsxRuntime.jsx("div", {}) }, `vr-${idx}`);
          default:
            return /* @__PURE__ */ jsxRuntime.jsx(
              Button,
              {
                $active: btn.isActive(editorState),
                $disabled: btn.isDisabled ? btn.isDisabled() : false,
                disabled: btn.canUse ? !btn.canUse(editorState) : false,
                onClick: btn.command,
                children: /* @__PURE__ */ jsxRuntime.jsx(
                  reactMaterialSymbols.MaterialSymbol,
                  {
                    size: 25,
                    grade: -25,
                    weight: 200,
                    icon: btn.icon
                  }
                )
              },
              btn.icon + idx
            );
        }
      })
    ] }, groupIdx)) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      react$1.EditorContent,
      {
        editor,
        onKeyDown: handleKeyDown
      }
    ),
    showImageModal && /* @__PURE__ */ jsxRuntime.jsx("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999 }, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { background: "#fff", margin: "100px auto", padding: 20, borderRadius: 8, maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { children: "Select an image from Strapi assets" }),
      /* @__PURE__ */ jsxRuntime.jsx("input", { type: "text", placeholder: "Paste image URL here", onBlur: (e) => handleImageSelect(e.target.value) }),
      /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => setShowImageModal(false), children: "Cancel" })
    ] }) })
  ] });
};
Tiptap.displayName = "Tiptap";
exports.default = Tiptap;
