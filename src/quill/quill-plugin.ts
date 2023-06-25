import { BaseEditorPaletteItem, BaseEditorPlugin, BaseEditorWindow } from "../editor-common";
import { mxWindow,  mxShape, mxCell } from "mxgraph";

import 'quill';

import Quill from 'quill/core';

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default Quill

let quillDefaultText = "Default";
import quillDefaultSVG from "./quill.svg";

export class QuillEditorPluginWindow extends BaseEditorWindow {
  component: any;

  onFillWindow() {
    let maindiv = this.divEditor;
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    (maindiv as HTMLElement).style.backgroundColor = "white";
    let value = this.getCellValue();
    let extra_toolbar = (this.options.config) ? this.options.config.extra_toolbar : {}
    let extra_modules = (this.options.config) ? this.options.config.extra_modules : {}
    this.component = new Quill('#'+maindiv.id, {
      modules: {
        toolbar:  [
          [{ 'font': [] }, { 'size': [] }],
          [ 'bold', 'italic', 'underline', 'strike' ],
          [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
          [ { 'align': [] }],
          [ 'link', 'image', 'video' ],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [ 'clean' ],
          ... extra_toolbar
        ],
        ... extra_modules
      },
      placeholder: 'Compose an epic...',
      theme: 'snow',  // or 'bubble'
      ...this.options.config
    });   
    //this.component.setContents(value)
    this.component.root.innerHTML = value
  }

  async getEditorValue() {
    //return (this.component as Quill).getContents();
    return (this.component as Quill).root.innerHTML
  }

}
export class QuillEditorPlugin extends BaseEditorPlugin {

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
    if (!item.width) item.width = 50;
    if (!item.height) item.height = 20;

    // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
    if (!item.icon && !item.data)
      item.icon = "image/svg+xml," + btoa(quillDefaultSVG);
    if (!item.node && !item.data) item.node = "<editor />";
    if (!item.text && !item.data) item.text = quillDefaultText;

    super.setDefaultsPaletteItem(item);
  }
}

(window as any).pluginQuillEditorPlugin = QuillEditorPlugin;
QuillEditorPlugin.initPlugin(QuillEditorPluginWindow, "quill", {
  attributeName: "quillData",
  contextual: "Edit HTML with Quill",
  title: "Quill Editor",
  paletteItems: [
    {
      name: "quill",
      label: "Quill",
      palette: { name: "editors", label: "Editors" },
      style: "collapsable=0;"
    },
  ],
});
