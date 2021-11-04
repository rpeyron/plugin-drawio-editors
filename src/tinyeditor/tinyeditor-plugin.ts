import { BaseEditor, BaseEditorPaletteItem } from "../editor-common";
import { mxWindow, mxShape }  from "mxgraph";


import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

let tinyeditorDefaultText = "Default";
import tinyeditorDefaultSVG from "./square_1.svg";

const tinyeditor = require('tiny-editor');

export class TinyEditorPlugin extends BaseEditor {
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
    maindiv.setAttribute("data-tiny-editor", "")
    maindiv.innerHTML = value;

    // Tiny Editor only operates when loaded ; so we need to force load again...
    delete require.cache[require.resolve('tiny-editor/dist/bundle')]
    require('tiny-editor/dist/bundle');
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
    return div.querySelector(`#editor_${this.name}_div`).innerHTML;
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
    if (!item.width) item.width = 20;
    if (!item.height) item.height = 20;

    // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
    if (!item.icon && !item.data)
      item.icon = "image/svg+xml," + btoa(tinyeditorDefaultSVG);
    if (!item.node && !item.data) item.node = "<editor />";
    if (!item.text && !item.data) item.text = tinyeditorDefaultText;

    super.setDefaultsPaletteItem(item);
  }
}

(window as any).pluginTinyEditorPlugin = new TinyEditorPlugin("tinyeditor", {
  attributeName: "tinyeditorData",
  contextual: "Edit HTML with TinyEditor",
  title: "TinyEditor Editor",
  paletteItems: [
    {
      name: "tinyeditor",
      label: "TinyEditor",
      palette: { name: "editors", label: "Editors" },
      style: "collapsable=0;"
    },
  ],
});
