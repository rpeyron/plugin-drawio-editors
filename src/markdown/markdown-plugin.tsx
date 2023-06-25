import { BaseEditorPaletteItem, BaseEditorPlugin, BaseEditorWindow } from '../editor-common'

import * as React from 'react';
import ReactDOM from "react-dom";

// https://github.com/outline/rich-markdown-editor
import Editor from "rich-markdown-editor";

let markdownDefaultText = "Default"
import markdownDefaultSVG from './Markdown-mark.svg'

export class MarkdownEditorWindow extends BaseEditorWindow {

  component : any;

  onFillWindow() {
    let divEditor = this.divEditor
    divEditor.style.padding = "8px 0px 0px 8px";
    divEditor.style.backgroundColor = "white";
    let value = this.getCellValue();
    this.component = ReactDOM.render(<Editor autoFocus defaultValue={value} onChange={function(){}} {...this.options.config} />, divEditor);
  }

  onShowWindow() {
    super.onShowWindow();
    (this.component as Editor).focusAtStart();
    /*
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).style.padding = "4px";
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).tabIndex = 0;
    (maindiv.firstElementChild.firstElementChild.firstElementChild as HTMLElement).focus();
    */
  }


  async getEditorValue() {
      return (this.component as Editor).value()
  }
}

export class MarkdownEditorPlugin extends BaseEditorPlugin {

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

(window as any).pluginMarkdownEditorPlugin = MarkdownEditorPlugin;
MarkdownEditorPlugin.initPlugin(MarkdownEditorWindow, 'markdown', {
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