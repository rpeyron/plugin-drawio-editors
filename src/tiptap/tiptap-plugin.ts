import { BaseEditor, BaseEditorPaletteItem } from "../editor-common";
import { mxWindow,  mxShape } from "mxgraph";

import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

let tiptapDefaultText = "Default";
import tiptapDefaultSVG from "!!raw-loader!./tiptap.svg"; 

export class TiptapEditorPlugin extends BaseEditor {
  component: any;

  onFillWindow(
    editorUi: any,
    div: HTMLDivElement,
    win: mxWindow,
    shape: mxShape
  ) {
    let maindiv = div.querySelector(`#editor_${this.name}_div`);
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    (maindiv as HTMLElement).style.backgroundColor = "white";
    let value = this.getShapeValue(editorUi, shape);
    this.component = new Editor({
      element: maindiv,
      extensions: [StarterKit],
      content: value,
      ...this.options.config
    });
  }

  onShowWindow(
    editorUi: any,
    div: HTMLDivElement,
    win: mxWindow,
    shape: mxShape
  ) {
    super.onShowWindow(editorUi, div, win, shape);
  }

  async getEditorValue(editorUi: any, div: HTMLDivElement, win: mxWindow) {
    return (this.component as Editor).getHTML();
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
    if (!item.width) item.width = 32;
    if (!item.height) item.height = 32;

    // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
    if (!item.icon && !item.data)
      item.icon = "image/svg+xml," + btoa(tiptapDefaultSVG);
    if (!item.node && !item.data) item.node = "<editor />";
    if (!item.text && !item.data) item.text = tiptapDefaultText;

    super.setDefaultsPaletteItem(item);
  }
}

new TiptapEditorPlugin("tiptap", {
  attributeName: "tiptapData",
  contextual: "Edit HTML with TipTap",
  title: "TipTap Editor",
  paletteItems: [
    {
      name: "tiptap",
      label: "TipTap",
      palette: { name: "editors", label: "Editors" },
      style: "collapsable=0;"
    },
  ],
});
