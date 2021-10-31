import { BaseEditor, BaseEditorPaletteItem } from "../editor-common";
import {  mxWindow,  mxShape,} from "mxgraph";

import EditorJS from '@editorjs/editorjs';



let editorjsDefaultText = "{}";
import editorjsDefaultSVG from "./editorjs.svg";

export class EditorjsEditorPlugin extends BaseEditor {
  component: any;

  onFillWindow(
    editorUi: any,
    div: HTMLDivElement,
    win: mxWindow,
    shape: mxShape
  ) {
    let maindiv = div.querySelector(`#editor_${this.name}_div`);
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    let value = this.getShapeValue(editorUi, shape);
    let data = {}
    try {
      data = JSON.parse(value)
    } catch(e) {console.log(e)}
    this.component = new EditorJS({
      holder: `editor_${this.name}_div`,
      data: data,
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
    return await this.component.save()
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
    if (!item.width) item.width = 20;
    if (!item.height) item.height = 20;

    // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
    if (!item.icon && !item.data)
      item.icon = "image/svg+xml," + btoa(editorjsDefaultSVG);
    if (!item.node && !item.data) item.node = "<editor />";
    if (!item.text && !item.data) item.text = editorjsDefaultText;

    super.setDefaultsPaletteItem(item);
  }
}

new EditorjsEditorPlugin("editorjs", {
  attributeName: "editorjsData",
  contextual: "Edit with EditorJS",
  title: "EditorJS Editor",
  paletteItems: [
    {
      name: "editorjs",
      label: "EditorJS",
      palette: { name: "editors", label: "Editors" },
      style: "collapsable=0;"
    },
  ],
});
