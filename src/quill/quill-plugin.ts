import { BaseEditor, BaseEditorPaletteItem } from "../editor-common";
import { mxWindow,  mxShape } from "mxgraph";

import 'quill';

import Quill from 'quill/core';

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default Quill

let quillDefaultText = "Default";
import quillDefaultSVG from "./quill.svg";

export class QuillEditorPlugin extends BaseEditor {
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
    this.component = new Quill(`#editor_${this.name}_div`, {
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
          ...this.options.config.extra_toolbar
        ],
        ...this.options.config.extra_modules
      },
      placeholder: 'Compose an epic...',
      theme: 'snow',  // or 'bubble'
      ...this.options.config
    });   
    //this.component.setContents(value)
    this.component.root.innerHTML = value
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
    //return (this.component as Quill).getContents();
    return (this.component as Quill).root.innerHTML
  }

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

new QuillEditorPlugin("quill", {
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
