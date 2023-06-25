import { BaseEditorPaletteItem, BaseEditorPlugin, BaseEditorWindow } from "../editor-common";


import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

let tinyeditorDefaultText = "Default";
import tinyeditorDefaultSVG from "./square_1.svg";

const tinyeditor = require('tiny-editor');

export class TinyEditorWindow extends BaseEditorWindow {
  component: any;

  onFillWindow() {
    let maindiv = this.divEditor;
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    (maindiv as HTMLElement).style.backgroundColor = "white";
    let value = this.getCellValue();
    maindiv.setAttribute("data-tiny-editor", "")
    maindiv.innerHTML = value;

    // Tiny Editor only operates when loaded ; so we need to force load again...
    delete require.cache[require.resolve('tiny-editor/dist/bundle')]
    require('tiny-editor/dist/bundle');
  }

  async getEditorValue() {
    return this.divEditor.innerHTML;
  }

}
export class TinyEditorPlugin extends BaseEditorPlugin {

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

(window as any).pluginTinyEditorPlugin = TinyEditorPlugin;
TinyEditorPlugin.initPlugin(TinyEditorWindow, "tinyeditor", {
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
