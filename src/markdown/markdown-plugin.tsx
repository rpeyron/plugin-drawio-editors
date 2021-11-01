import { BaseEditor, BaseEditorPaletteItem } from '../editor-common'
import  { mxWindow, mxUtils, mxResources, mxShape, mxCell, mxEvent, mxGeometry } from "mxgraph";

import * as React from 'react';
import ReactDOM from "react-dom";

// https://github.com/outline/rich-markdown-editor
import Editor from "rich-markdown-editor";

let markdownDefaultText = "Default"
import markdownDefaultSVG from './Markdown-mark.svg'

export class MarkdownEditorPlugin extends BaseEditor {

  component : any;

  onFillWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {
    let maindiv = div.querySelector(`#editor_${this.name}_div`);
    (maindiv as HTMLElement).style.padding = "8px 0px 0px 8px";
    (maindiv as HTMLElement).style.backgroundColor = "white";
    let value = this.getShapeValue(editorUi, shape);
    this.component = ReactDOM.render(<Editor autoFocus defaultValue={value} onChange={function(){}} {...this.options.config} />, maindiv);
  }

  onShowWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {
    super.onShowWindow(editorUi, div, win, shape);
    (this.component as Editor).focusAtStart();
    /*
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).style.padding = "4px";
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).tabIndex = 0;
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).focus();
    */
  }


  async getEditorValue(editorUi: any, div: HTMLDivElement, win: mxWindow) {
      return (this.component as Editor).value()
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {

      if (!item.width)  item.width = 50
      if (!item.height) item.height = 30

      // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
      if (!item.icon && !item.data) item.icon = "image/svg+xml,"+btoa(markdownDefaultSVG)
      if (!item.node && !item.data) item.node = "<editor />"
      if (!item.text && !item.data) item.text = markdownDefaultText

      super.setDefaultsPaletteItem(item)
  }

}

new MarkdownEditorPlugin('markdown', {
    attributeName: "markdownData",
    contextual: "Edit with Markdown Editor",
    title: "Markdown Editor",
    paletteItems: [
        {
            name: "markdown",
            label: "Markdown",
            palette: { name: "editors", label: "Editors"},
        },
    ]
})