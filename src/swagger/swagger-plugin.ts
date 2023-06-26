import { BaseEditorPaletteItem, BaseEditorPlugin, BaseEditorWindow } from '../editor-common'

import SwaggerEditor from 'swagger-editor';
import 'swagger-editor/dist/swagger-editor.css';

// Swagger
import swaggerDefaultText from './swagger_petstore.yaml'
import swaggerDefaultSVG from './swagger.svg'

// OpenAPI 3.0  (from https://github.com/OAI/OpenAPI-Style-Guide)
import openApi3DefaultText from './api-with-examples.yaml'
import openApi3DefaultSVG from './OpenAPI_Logo_Stacked_Pantone-cropped.svg'


export class SwaggerEditorWindow extends BaseEditorWindow {

  swaggerUi : any;

  onFillWindow() {
    let divEditor = this.divEditor
    // https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md
    let ui = SwaggerEditor({
      dom_id: "#"+divEditor.id,
      layout: 'EditorLayout',
      ...this.options.config
    })
    this.swaggerUi = ui;
    ui.specActions.updateSpec(this.getCellValue());
    (<HTMLElement>divEditor.querySelector('.Pane2')).style.overflow = 'auto';
  }

  onShowWindow() {
    super.onShowWindow();
    (<HTMLElement>this.divEditor.querySelector('.ace_text-input'))?.focus();
  }


  getEditorValue() {
    return (this.swaggerUi)?this.swaggerUi.specSelectors.specStr():""
  }
}

export class SwaggerEditorPlugin extends BaseEditorPlugin {

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {

      if (!item.icon && !item.data) item.icon = "image/svg+xml,"+btoa(swaggerDefaultSVG)
      if (!item.node && !item.data) item.node = "<editor />"
      if (!item.text && !item.data) item.text = swaggerDefaultText

      super.setDefaultsPaletteItem(item)
  }

}

(window as any).pluginSwaggerEditorPlugin = SwaggerEditorPlugin;
SwaggerEditorPlugin.initPlugin(SwaggerEditorWindow, 'swagger', {
    attributeName: "swaggerData",
    contextual: "Edit with Swagger Editor",
    title: "Swagger Editor",
    maximize: true,
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