import { WidgetType } from "@codemirror/view";
import type { EditorView } from "@codemirror/view";

export const TASK_LINE_RE = /^(\s*)([-*+]\s+)\[([ xX])\](\s*)/;

export class TaskCheckboxWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly lineFrom: number,
  ) {
    super();
  }

  eq(other: TaskCheckboxWidget) {
    return (
      other.checked === this.checked && other.lineFrom === this.lineFrom
    );
  }

  toDOM(view: EditorView) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.checked;
    input.className = "cm-live-task-checkbox";
    input.setAttribute("aria-label", this.checked ? "Checked task" : "Task");
    input.addEventListener("mousedown", (e) => e.preventDefault());
    input.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const line = view.state.doc.lineAt(this.lineFrom);
      const match = line.text.match(TASK_LINE_RE);
      if (!match) return;
      const nextChecked = !this.checked;
      const mark = nextChecked ? "x" : " ";
      const nextLine = line.text.replace(/\[([ xX])\]/, `[${mark}]`);
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: nextLine },
      });
    });
    return input;
  }

  ignoreEvent() {
    return false;
  }
}

export class BulletWidget extends WidgetType {
  constructor(readonly isNested: boolean = false) {
    super();
  }

  eq(other: BulletWidget) {
    return other.isNested === this.isNested;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = this.isNested
      ? "cm-live-bullet cm-live-bullet-nested"
      : "cm-live-bullet";
    span.setAttribute("aria-hidden", "true");
    return span;
  }
}
