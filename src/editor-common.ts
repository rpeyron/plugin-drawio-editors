import  { mxWindow, mxUtils, mxResources, mxShape, mxCell, mxEvent, mxGeometry } from "mxgraph";
import * as merge from 'deepmerge'

/** Default options for editor */
export interface BaseEditorOptions {
    /** The name of attribute to consider */
    attributeName: string

    /** Weither the editor should react on double click or not (default: false) */
    ignoreDoubleClic?: boolean

    /** If defined and not empty, adds a menu with this title to edit the item */
    contextual?: string

    /** Edit window title */
    title?: string

    /** Define the way to display item ; supported
     *   - "shape" : does not affect the way the shape is displayed
     */
    display?: "shape"

    /** Define the palette items */
    paletteItems?: BaseEditorPaletteItem[]

    /** Extra config of the components (plugin internals dependant)
    */
    config?: any;

}

export interface BaseEditorPaletteItem {

  /** The palette to include the palette item in. 
    *  The palette will be search with the provided name. 
    *  If not found, will be created, with the label if provided or with the name if not.
    */
  palette: string | { name: string, label: string}

  /** The name of the palette item */
  name: string;

  /** The label of the palette item */
  label?: string;

  /** The width of the palette item */
  width?: number;

  /** The height of the palette item */
  height?: number;

  /** The data of the palette item.
    *  Data created with pasting the copied item in https://jgraph.github.io/drawio-tools/tools/convert.html
    *   and URL Decode then Encode.
    *  When data is used, any other attribute below is ignored.
    */
  data?: string;

  /** The data of the icon to display */
  icon?: string;

  /** The text included in the palette item */
  text?: string;

  /** The style to be appended to the palette item */
  style?: string;

  /** The node definition in the palette item (the XML will be parsed). 
    *  Should include the attributeName.
    *  If none provided, a node with attributeName defined will be created.
    */
  node?: string;

}

export class BaseEditor {

  editorUi: any;
  name: string;
  options: BaseEditorOptions;

  constructor(name: string, options : BaseEditorOptions) {
    this.name = name;
    this.options = options;

    let me = this;
    //@ts-ignore
    Draw.loadPlugin(function (editorUi: any) {
      me.declareUiFunctions(editorUi);
    })

  }

  declareUiFunctions(editorUi: any) {
    let me = this;

    this.editorUi = editorUi;

    // Handle options

    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
    // Default options are provided by the plugin
    let options = this.options

    // Then apply options of defaultEditorsConfig if any (define it in PreConfig.js)
    //@ts-ignore
    let defaultEditorsConfig = window.EditorUi.defaultEditorsConfig;
    if (defaultEditorsConfig && defaultEditorsConfig[this.name]) {
      options = merge(options, defaultEditorsConfig[this.name], { arrayMerge: overwriteMerge })
    }

    // Then apply options of local user
    //@ts-ignore
    let userConfig = window.Editor.config;
    if (userConfig && userConfig.defaultEditorsConfig && userConfig.defaultEditorsConfig[this.name]) {
      options = merge(options, userConfig.defaultEditorsConfig[this.name], { arrayMerge: overwriteMerge })
    }

    if (!options.title || options.title.length == 0) { options.title = "Editor" }

    this.options = options;


    // Double clic
    if (!this.options.ignoreDoubleClic) {
      editorUi.editor.graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
        var cell = evt.getProperty("cell");
        if (me.isCellHandled(cell)) { 
          evt.consume();
          me.showDialogCell(editorUi, cell);
        }
      });
    }

    // Contextual
    if (this.options.contextual && (this.options.contextual.length > 0)) {
      let prevPopupMethod = editorUi.editor.graph.popupMenuHandler.factoryMethod;
      editorUi.editor.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
      { 
        prevPopupMethod(menu, cell, evt);
        if(me.isCellHandled(cell)) {
          menu.addItem(me.options.contextual, null, function() { 
            me.showDialogCell(editorUi, cell);
          })
      }}
    }

    // Palette Items
    for(let item of this.options.paletteItems) {

      let paletteName = (typeof item.palette == "string") ? item.palette : item.palette.name;
      let paletteLabel = (typeof item.palette == "string") ? item.palette : item.palette.label;

      // Defaults
      this.setDefaultsPaletteItem(item);

      // If the palette does not exists, create it      
      if (! editorUi.sidebar.palettes[paletteName]) {
        editorUi.sidebar.addPaletteFunctions(paletteName, paletteLabel, true, [])
      }

      // Add item to palette
      let palette = editorUi.sidebar.palettes[paletteName][1];

      if (item.data) {
        let itemelt = editorUi.sidebar.addDataEntry(item.name, item.width, item.height, item.label, item.data);
        if ((palette) && (palette.firstChild)) palette.firstChild.appendChild(itemelt)
      } else {
         let node =  mxUtils.parseXml(item.node).getRootNode().firstChild;
         // if (!node) { let doc = mxUtils.createXmlDocument(); node = doc.createElement('editor') }
         let cell = new mxCell(node, new mxGeometry(0, 0, item.width, item.height), "shape=image;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;verticalAlign=top;aspect=fixed;imageAspect=0;image=data:"+item.icon+";"+item.style);
         cell.vertex = true;
         cell.setAttribute(me.options.attributeName, item.text);
         let itemelt = editorUi.sidebar.createVertexTemplateFromCells([cell], item.width, item.height, item.label, true, true)
         if ((palette) && (palette.firstChild)) palette.firstChild.appendChild(itemelt)
      }

    }

  }

  setDefaultsPaletteItem(item: BaseEditorPaletteItem) {
      if (!item.label)  item.label = item.name
      if (!item.width)  item.width = 50
      if (!item.height) item.height = 50

      if (!item.icon && !item.data) item.icon = "image/svg+xml,"+btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect x="20" y="20" width="40" height="40"/></svg>')
      if (!item.style && !item.data) item.style = ""
      if (!item.node && !item.data) item.node = "<editor />"
      if (!item.text && !item.data) item.text = " "
  }

  isCellHandled(cell: mxCell) {
    if (!cell) { return false; }
    //@ts-ignore isNode does not require node name
    if (mxUtils.isNode(cell.value)) {
      if (cell.getAttribute(this.options.attributeName, '') != '') {
        return true;
      }
    }
    return false;
  }
  
  showDialog(editorUi: any, shape: mxShape) {
    let me = this;

    // Main element
    let div = document.createElement('div');
    div.style.cssText = "display: flex; flex-direction: column; height: inherit;";
    div.innerHTML = `
      <div id="editor_${me.name}_div" style="flex: 1; /*text-align: center;*/  overflow-y: scroll;"></div>
      <div id="plugin_editor_${me.name}_buttons" style="flex: initial; text-align: right; align-self: flex-end; padding: 8px;"></div>
      `;

    let buttons = div.querySelector(`#plugin_editor_${me.name}_buttons`);

    // Create mxWindow
    let win_width = 800;
    let win_height = 640;
    if (editorUi.diagramContainer.clientWidth < win_width) win_width = editorUi.diagramContainer.clientWidth - 20;
    if (editorUi.diagramContainer.clientHeight < win_height) win_height = editorUi.diagramContainer.clientHeight - 20;

    var win = new mxWindow(this.options.title, div, 
      (editorUi.diagramContainer.clientWidth - win_width) / 2 + editorUi.diagramContainer.offsetLeft, 
      (editorUi.diagramContainer.clientHeight - win_height) / 2 + editorUi.diagramContainer.offsetTop, 
      win_width, 
      win_height, 
      true, true);
    win.setResizable(true);
    win.setMaximizable(true);
    win.setClosable(true);

    // Cancel button behavior
    var cancelBtn = mxUtils.button(mxResources.get('close'), function () { me.cancel(editorUi, div, win, shape); });
    cancelBtn.className = 'geBtn';
    if (editorUi.editor.cancelFirst) {  buttons.appendChild(cancelBtn); }

    // OK button behavior
    var okBtn = mxUtils.button(mxResources.get('apply'), function (evt) { me.validate(editorUi, div, win, shape); });
    buttons.appendChild(okBtn);
    okBtn.className = 'geBtn gePrimaryBtn';
    if (!editorUi.editor.cancelFirst) { buttons.appendChild(cancelBtn); }

    // Prevent drawio keydown listeners to allow cut/copy/paste
    div.addEventListener('keydown', (event) => {
      event.stopPropagation()
    });

    // Call function to add actual editor
    me.onFillWindow(editorUi, div, win, shape);

    // Show Window
    win.show();

    // Call function to focus editor
    me.onShowWindow(editorUi, div, win, shape);

  }

  showDialogCell(editorUi: any, cell: mxCell) {
    var shape = editorUi.editor.graph.view.states["map"][cell.mxObjectId].shape;
    if (shape) {
      this.showDialog(editorUi, shape);
    }
  }


  // Default implementation does nothing
  onFillWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {

  }

  // Default implementation does nothing
  onShowWindow(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {
    if (this.editorUi && 
        this.editorUi.editor && 
        this.editorUi.editor.graph && 
        this.editorUi.editor.graph.tooltipHandler && 
        this.editorUi.editor.graph.tooltipHandler.hide)
            this.editorUi.editor.graph.tooltipHandler.hide();
  }


  // Default implementation of validate
  async validate(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {
    if (editorUi.spinner.spin(document.body, mxResources.get('inserting'))) {
      var graph = editorUi.editor.graph;
      graph.getModel().beginUpdate();
      this.setShapeValue(editorUi, shape, await this.getEditorValue(editorUi, div, win));
      graph.getModel().endUpdate();
      editorUi.spinner.stop();
      if (shape.state.cell != null) {
        graph.setSelectionCell(shape.state.cell);
        graph.scrollCellToVisible(shape.state.cell);
      }
    }
    win.destroy();
  }

  // Default implementation of cancel
  cancel(editorUi: any, div: HTMLDivElement, win: mxWindow, shape: mxShape) {
    win.destroy();
  }

  // Default implementation to get editor value, used in default implementation of validate
  async getEditorValue(editorUi: any, div?: HTMLDivElement, win?: mxWindow) : Promise<string> {
    return ""  
  }

  // Default implementation to get shape value
  getShapeValue(editorUi: any, shape: mxShape) : string {
    if (shape && shape.state && shape.state.cell)
      return shape.state.cell.getAttribute(this.options.attributeName, '')
    return "";
  }

  // Default implementation to set shape value
  setShapeValue(editorUi: any, shape: mxShape, text: string) {
    if (shape && shape.state && shape.state.cell && shape.state.cell.value) {
        //@ts-ignore  isNode does not require always the node name
        if (mxUtils.isNode(shape.state.cell.value)) {
          shape.state.cell.setAttribute(this.options.attributeName, text);
        }
    }
  }

}



