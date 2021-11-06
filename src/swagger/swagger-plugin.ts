import { BaseEditor, BaseEditorPaletteItem } from '../editor-common'
import  { mxWindow, mxUtils, mxResources, mxShape, mxCell, mxEvent, mxGeometry } from "mxgraph";

import SwaggerEditor from 'swagger-editor';
import 'swagger-editor/dist/swagger-editor.css';

// Swagger
import swaggerDefaultText from './swagger_petstore.yaml'
import swaggerDefaultSVG from './swagger.svg'

// OpenAPI 3.0  (from https://github.com/OAI/OpenAPI-Style-Guide)
import openApi3DefaultText from './api-with-examples.yaml'
import openApi3DefaultSVG from './OpenAPI_Logo_Stacked_Pantone-cropped.svg'


export class SwaggerEditorPlugin extends BaseEditor {

  ui : any;

  onFillWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, cell: mxCell) {
    // https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md
    this.ui = SwaggerEditor({
      dom_id: `#editor_${this.name}_div`,
      layout: 'EditorLayout',
      ...this.options.config
    });
    this.ui.specActions.updateSpec(this.getCellValue(editorUi, cell));
    (<HTMLElement>div.querySelector('.Pane2')).style.overflow = 'auto';
  }

  onShowWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, cell: mxCell) {
    super.onShowWindow(editorUi, div, win, cell);
    //@ts-ignore  undocumented maximize property
    win.title.dispatchEvent(new Event('dblclick'));
    (<HTMLElement>div.querySelector('.ace_text-input'))?.focus();
  }


  getEditorValue(editorUi: any, div: HTMLDivElement, win: mxWindow) {
      return this.ui.specSelectors.specStr()
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {

      if (!item.icon && !item.data) item.icon = "image/svg+xml,"+btoa(swaggerDefaultSVG)
      if (!item.node && !item.data) item.node = "<editor />"
      if (!item.text && !item.data) item.text = swaggerDefaultText

      super.setDefaultsPaletteItem(item)
  }

}

(window as any).pluginSwaggerEditorPlugin = new SwaggerEditorPlugin('swagger', {
    attributeName: "swaggerData",
    contextual: "Edit with Swagger Editor",
    title: "Swagger Editor",
    paletteItems: [
        {
            name: "swagger",
            label: "Swagger",
            palette: { name: "editors", label: "Editors"},
        },
        {
            name: "openapi3",
            label: "Open API 3.0",
            width: 50,
            height: 50,
            palette: { name: "editors", label: "Editors"},
            icon: "image/svg+xml,"+btoa(openApi3DefaultSVG),
            text: openApi3DefaultText
        },
    ]
})