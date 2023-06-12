import { BaseEditor, BaseEditorPaletteItem } from "../editor-common";
import { mxWindow, mxShape, mxCell } from "mxgraph";

import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';


import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import "bpmn-js-properties-panel/dist/assets/properties-panel.css";


import bpmnDefaultSVG from "./BPMN-logo.svg";

let  bpmnDefaultXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;

export class BPMNEditorPlugin extends BaseEditor {

  component: BpmnModeler;

  async onFillWindow(
    editorUi: any,
    div: HTMLDivElement,
    win: mxWindow,
    cell: mxCell
  ) {
    let maindiv = div.querySelector(`#editor_${this.name}_div`) as HTMLDivElement;
    maindiv.style.padding = "8px 0px 0px 8px";
    maindiv.style.backgroundColor = "white";
    maindiv.innerHTML = `<div class="bpmn_modeler" style="display: flex; height: 100%;">
      <div id="bpmn_canvas" style="flex: 1"></div>
      <div id="bpmn_properties" style="display: none; flex: 0 25%;"></div>
    </div>`;

    let modelerOptions = {
      container: "#bpmn_canvas", // `#editor_${this.name}_div`,
      keyboard: {
        bindTo: window
      },
      additionalModules: [],
      ...this.options.config
    }

    if (this.options.config?.propertiesPanel) {
      let propdiv = div.querySelector(`#bpmn_properties`) as HTMLDivElement
      if (propdiv) propdiv.style.display="block"
      modelerOptions.propertiesPanel = {
        parent: '#bpmn_properties'
      }
      modelerOptions.additionalModules = [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ...modelerOptions.additionalModules
      ]
    }

    this.component = new BpmnModeler(modelerOptions)
    console.log("BPMN Component:", this, this.component, modelerOptions)

    let value = this.getCellValue(editorUi, cell);
    try {
      await this.component.importXML(value);
      // container.removeClass('with-error').addClass('with-diagram');
    } catch (err) {
      // container.removeClass('with-diagram').addClass('with-error');
      // container.find('.error pre').text(err.message);
      console.error("BPMN.importXML Error:", err);
    }
  }

  onShowWindow(
    editorUi: any,
    div: HTMLDivElement,
    win: mxWindow,
    cell: mxCell
  ) {
    super.onShowWindow(editorUi, div, win, cell);
  }

  async getEditorValue(editorUi: any, div: HTMLDivElement, win: mxWindow) {
    // const { svg } = await modeler.saveSVG();
    const { xml } = await this.component.saveXML({ format: true });
    return xml
  }

  async validate(editorUi: any, div: HTMLDivElement, win: mxWindow, cell: mxCell, close: boolean = true) {

    // Replace cell with SVG
    const { svg } = await this.component.saveSVG();
    let cellStyle = cell.getStyle();
    let cellElts = cellStyle.split(";");
    let newImage = "image=data:image/svg+xml," + btoa(svg);
    let newStyle = cellElts.map((e) => { 
      if (e.startsWith('image=')) { return newImage} 
      // Force remove aspect & imageAspect added by default
      if (e.startsWith('aspect=')) { return null } 
      if (e.startsWith('imageAspect=')) { return null } 
      return e
    } ).filter(e => e).join(";")
    cell.setStyle(newStyle);
    await super.validate(editorUi, div, win, cell, close);
  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
    if (!item.width) item.width = 50;
    if (!item.height) item.height = 20;

    if (!item.icon && !item.data)
      item.icon = "image/svg+xml," + btoa(bpmnDefaultSVG);
    if (!item.node && !item.data) item.node = "<editor />";
    if (!item.text && !item.data) item.text = bpmnDefaultXML;

    super.setDefaultsPaletteItem(item);
  }
}

(window as any).pluginBPMNEditorPlugin = new BPMNEditorPlugin("BPMN", {
  attributeName: "bpmnData",
  contextual: "Edit BPMN",
  title: "BPMN Editor",
  paletteItems: [
    {
      name: "BPMN",
      label: "BPMN",
      palette: { name: "editors", label: "Editors" },
      style: "collapsable=0;"
    },
  ],
  config: {
    propertiesPanel: true
  }
});
