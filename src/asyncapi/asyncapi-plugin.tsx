import { BaseEditor, BaseEditorPaletteItem } from '../editor-common'
import  { mxWindow, mxUtils, mxResources, mxShape, mxCell, mxEvent, mxGeometry } from "mxgraph";

import * as React from 'react';
import ReactDOM from "react-dom";
import AsyncApiComponent from "@asyncapi/react-component";

// https://github.com/asyncapi/asyncapi-react
import "@asyncapi/react-component/lib/styles/fiori.css";

import asyncApiDefaultText from './asyncapi-example.yaml'

export class AsyncApiEditorPlugin extends BaseEditor {

  component : any;

  onFillWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, cell: mxCell) {
    let maindiv = div.querySelector(`#editor_${this.name}_div`);
    let schema = this.getCellValue(editorUi, cell);
    this.component = ReactDOM.render(<AsyncApiComponent schema={schema} config={Object.assign({}, this.options.config)} />, maindiv);

    //(<HTMLElement>div.querySelector('.Pane2')).style.overflow = 'auto';
  }

  async getEditorValue(editorUi: any, div: HTMLDivElement, win: mxWindow) {
      //(this.component as AsyncApiComponent).
      return "" //this.ui.specSelectors.specStr()
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {

      // https://raw.githubusercontent.com/asyncapi/spec/master/assets/asyncapi.xml
      if (!item.icon && !item.data) item.icon = "image/svg+xml,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE5Ny40NjNweCIgaGVpZ2h0PSIyMzIuMDk4cHgiIHZpZXdCb3g9IjAgMCAxOTcuNDYzIDIzMi4wOTgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE5Ny40NjMgMjMyLjA5OCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+JiN4YTs8Zz4mI3hhOwk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc3NUI5IiBzdHJva2Utd2lkdGg9IjEzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9IiAgIE0xNjMuNTQ5LDE1OS45MDFjMCwyNC44ODktMjguMTI4LDQ1LjA2NS02Mi44MjUsNDUuMDY1Yy0zNC42OTcsMC02Mi44MjUtMjAuMTc3LTYyLjgyNS00NS4wNjUiLz4mI3hhOwk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc3NUI5IiBzdHJva2Utd2lkdGg9IjEzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9IiAgIE0zNy44OTksNjkuMTUzYzAtMjQuODg5LDI4LjEyOC00NS4wNjYsNjIuODI1LTQ1LjA2NmMzNC42OTcsMCw2Mi44MjUsMjAuMTc3LDYyLjgyNSw0NS4wNjYiLz4mI3hhOwkmI3hhOwkJPGxpbmUgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzYzQkE4RiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNDQuMjg3IiB5MT0iODguNTM2IiB4Mj0iMTE2LjEyMSIgeTI9IjE0MC41NTgiLz4mI3hhOwkmI3hhOwkJPGxpbmUgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzYzQkE4RiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iODUuODc5IiB5MT0iODguNDU3IiB4Mj0iMTU3LjcxMyIgeTI9IjE0MC40NzkiLz4mI3hhOzwvZz4mI3hhOzwvc3ZnPg=="
      if (!item.node && !item.data) item.node = "<editor />"
      if (!item.text && !item.data) item.text = asyncApiDefaultText

      super.setDefaultsPaletteItem(item)
  }

}

(window as any).pluginAsyncApiEditorPlugin = new AsyncApiEditorPlugin('asyncApi', {
    attributeName: "asyncApiData",
    contextual: "Edit with Async API Editor",
    title: "AsyncAPI Editor",
    paletteItems: [
        {
            name: "asyncapi",
            label: "Async API",
            palette: { name: "editors", label: "Editors"},
        },
    ]
})