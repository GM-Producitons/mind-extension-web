import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import type { Range } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import {
  BulletWidget,
  TASK_LINE_RE,
  TaskCheckboxWidget,
} from "./task-checkbox-widget";

const MARK_NODES = new Set([
  "HeaderMark",
  "QuoteMark",
  "CodeMark",
  "EmphasisMark",
  "StrikethroughMark",
  "LinkMark",
  "URL",
]);

const HEADING_NODES = new Set([
  "ATXHeading1",
  "ATXHeading2",
  "ATXHeading3",
  "ATXHeading4",
  "ATXHeading5",
  "ATXHeading6",
  "SetextHeading1",
  "SetextHeading2",
]);

const HEADING_LINE_CLASS: Record<string, string> = {
  ATXHeading1: "cm-live-h1",
  ATXHeading2: "cm-live-h2",
  ATXHeading3: "cm-live-h3",
  ATXHeading4: "cm-live-h4",
  ATXHeading5: "cm-live-h5",
  ATXHeading6: "cm-live-h6",
  SetextHeading1: "cm-live-h1",
  SetextHeading2: "cm-live-h2",
};

const HIGHLIGHT_RE = /==([^=\n][^=\n]*|[^=\n])==/g;

const SETEXT_UNDERLINE_RE = /^\s*(=+|-+)\s*$/;

function selectionTouchesRange(
  view: EditorView,
  from: number,
  to: number,
  blockLine?: number,
): boolean {
  for (const range of view.state.selection.ranges) {
    if (range.from <= to && range.to >= from) return true;
    if (blockLine !== undefined) {
      const line = view.state.doc.lineAt(range.head);
      if (line.number === blockLine) return true;
    }
  }
  return false;
}

function addHighlightDecorations(
  view: EditorView,
  decorations: Range<Decoration>[],
  from: number,
  to: number,
) {
  const { state } = view;
  let pos = from;
  while (pos <= to) {
    const line = state.doc.lineAt(pos);
    if (line.from <= to) {
      const text = line.text;
      HIGHLIGHT_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = HIGHLIGHT_RE.exec(text)) !== null) {
        const openStart = line.from + match.index;
        const openEnd = openStart + 2;
        const contentStart = openEnd;
        const contentEnd = contentStart + match[1].length;
        const closeStart = contentEnd;
        const closeEnd = closeStart + 2;

        if (!selectionTouchesRange(view, openStart, closeEnd)) {
          decorations.push(
            Decoration.mark({ class: "cm-live-highlight" }).range(
              contentStart,
              contentEnd,
            ),
          );
          decorations.push(Decoration.replace({}).range(openStart, openEnd));
          decorations.push(Decoration.replace({}).range(closeStart, closeEnd));
        }
      }

      const taskMatch = text.match(TASK_LINE_RE);
      if (taskMatch) {
        const indentLen = taskMatch[1].length;
        const prefixStart = line.from + indentLen;
        const prefixText =
          taskMatch[2] + `[${taskMatch[3]}]` + taskMatch[4];
        const prefixEnd = prefixStart + prefixText.length;
        const checked = taskMatch[3].toLowerCase() === "x";

        if (!selectionTouchesRange(view, prefixStart, prefixEnd, line.number)) {
          decorations.push(
            Decoration.replace({
              widget: new TaskCheckboxWidget(checked, line.from),
            }).range(prefixStart, prefixEnd),
          );
        }
      } else if (SETEXT_UNDERLINE_RE.test(text)) {
        if (!selectionTouchesRange(view, line.from, line.to, line.number)) {
          decorations.push(
            Decoration.replace({}).range(line.from, line.to),
          );
        }
      }
    }
    if (line.number === state.doc.lines) break;
    pos = line.to + 1;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const { state } = view;

  for (const { from, to } of view.visibleRanges) {
    addHighlightDecorations(view, decorations, from, to);

    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        const nodeFrom = node.from;
        const nodeTo = node.to;
        const name = node.name;
        const line = state.doc.lineAt(nodeFrom);

        if (HEADING_NODES.has(name)) {
          const lineClass = HEADING_LINE_CLASS[name];
          if (lineClass) {
            decorations.push(
              Decoration.line({ class: lineClass }).range(line.from),
            );
          }
        }

        if (name === "HorizontalRule") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo, line.number)) {
            decorations.push(Decoration.replace({}).range(nodeFrom, nodeTo));
          }
        }

        if (name === "Blockquote") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo, line.number)) {
            decorations.push(
              Decoration.mark({ class: "cm-live-blockquote" }).range(
                nodeFrom,
                nodeTo,
              ),
            );
          }
        }

        if (name === "StrongEmphasis") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo)) {
            decorations.push(
              Decoration.mark({ class: "cm-live-strong" }).range(
                nodeFrom,
                nodeTo,
              ),
            );
          }
        }

        if (name === "Emphasis") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo)) {
            decorations.push(
              Decoration.mark({ class: "cm-live-emphasis" }).range(
                nodeFrom,
                nodeTo,
              ),
            );
          }
        }

        if (name === "InlineCode") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo)) {
            decorations.push(
              Decoration.mark({ class: "cm-live-code" }).range(nodeFrom, nodeTo),
            );
          }
        }

        if (name === "Link" || name === "URL") {
          if (!selectionTouchesRange(view, nodeFrom, nodeTo)) {
            decorations.push(
              Decoration.mark({ class: "cm-live-link" }).range(nodeFrom, nodeTo),
            );
          }
        }

        if (name === "ListMark") {
          // If this line is a task list (- [ ] or - [x]), TaskCheckboxWidget handles it
          if (TASK_LINE_RE.test(line.text)) {
            return;
          }
          const markText = state.sliceDoc(nodeFrom, nodeTo).trim();
          if (markText === "-" || markText === "*" || markText === "+") {
            if (!selectionTouchesRange(view, nodeFrom, nodeTo, line.number)) {
              const indent = line.text.slice(0, Math.max(0, nodeFrom - line.from));
              const isNested = indent.length >= 2;
              decorations.push(
                Decoration.replace({
                  widget: new BulletWidget(isNested),
                }).range(nodeFrom, nodeTo),
              );
            }
          }
          return;
        }

        if (MARK_NODES.has(name)) {
          const hide =
            name === "HeaderMark" || name === "QuoteMark"
              ? !selectionTouchesRange(view, nodeFrom, nodeTo, line.number)
              : !selectionTouchesRange(view, nodeFrom, nodeTo);

          if (hide) {
            decorations.push(Decoration.replace({}).range(nodeFrom, nodeTo));
          }
        }

        if (name === "Link") {
          syntaxTree(state).iterate({
            from: nodeFrom,
            to: nodeTo,
            enter(child) {
              if (
                child.name === "LinkTitle" ||
                child.name === "LinkLabel" ||
                child.name === "URL"
              ) {
                const cf = child.from;
                const ct = child.to;
                if (!selectionTouchesRange(view, cf, ct)) {
                  if (child.name === "URL") {
                    decorations.push(
                      Decoration.mark({ class: "cm-live-link" }).range(cf, ct),
                    );
                  }
                }
              }
            },
          });
        }
      },
    });
  }

  return Decoration.set(decorations, true);
}

export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged
      ) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);
