import { BaseEditorPaletteItem, BaseEditorPlugin, BaseEditorWindow } from "../editor-common";
import {  mxWindow,  mxShape, mxCell,} from "mxgraph";

import EditorJS from '@editorjs/editorjs';



let editorjsDefaultText = "{}";
import editorjsDefaultSVG from "./editorjs.svg";

export class EditorjsEditorWindow extends BaseEditorWindow {
  component: any;

  onFillWindow() {
    let maindiv = this.divEditor;
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    (maindiv as HTMLElement).style.backgroundColor = "white";
    let value = this.getCellValue();
    let data = {}
    try {
      data = JSON.parse(value)
    } catch(e) {console.log(e)}
    this.component = new EditorJS({
      holder: maindiv.id,
      data: data,
      ...this.options.config
    });
    
  }

  async getEditorValue() {
    return await this.component.save()
  }
}
export class EditorjsEditorPlugin extends BaseEditorPlugin {

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

(window as any).pluginEditorjsEditorPlugin = EditorjsEditorPlugin;
EditorjsEditorPlugin.initPlugin(EditorjsEditorWindow, "editorjs", {
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
