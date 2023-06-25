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

    /** Autoload: register to Drawio autaomatically (default: true)
     * if false, has to be registered manually with declareUiFunctions
     * declareUiFunctions can also be called from another UI instance
     */
    autoload?: boolean;

    /**
     * Window factory to create windows
     * default to mxWindow
     */
    windowFactory?: typeof PluginWindowFactory;

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

class PluginWindowFactory {

  title: string;
  contents: HTMLDivElement;

  constructor(title: string, contents: HTMLDivElement, x: number, y: number, width: number, height: number) {
    this.title = title;
    this.contents = contents;
  }

  show() {  }

  maximize() {  }

  destroy() {}

}

class mxWindowFactory extends PluginWindowFactory {

  win: mxWindow | undefined = undefined;

  constructor(title: string, contents: HTMLDivElement, x: number, y: number, width: number, height: number) {
    super(title, contents, x, y, width, height);
    let win = new mxWindow(title, contents, x, y, width, height, true, true);
    win.setResizable(true);
    win.setMaximizable(true);
    win.setClosable(true);
    this.win = win;
  }

  show(): void {
    this.win?.show()
  }

  destroy(): void {
    this.win?.destroy()
  }

  maximize(): void {
    //@ts-ignore  undocumented maximize property
    this.win?.title?.dispatchEvent(new Event('dblclick'));
  }


}



type BaseEditorWindowClassType = new (plugin: BaseEditorPlugin, editorUi: any, cell: mxCell, instance?: number) => BaseEditorWindow;

/**
 * BaseEditorWindow is the instance of the window to edit a given cell
 */
export class BaseEditorWindow {

  editorUi: any;
  cell: mxCell;

  divEditorId: string;
  divButtonsId: string;

  pluginName: string;
  options: BaseEditorOptions;

  win?: PluginWindowFactory;

  divEditor: HTMLDivElement;

  constructor(plugin: BaseEditorPlugin, editorUi: any, cell: mxCell, instance?: number) {

    let pluginName = plugin.staticClass.pluginName;
    let options = plugin.staticClass.options;

    this.pluginName = pluginName;
    this.options = options;
    this.editorUi = editorUi;

    this.cell = cell;

    // If no instance we use timestamp to get some unicity
    if (!instance) instance =  Date.now()

    this.divEditorId = `editor_${pluginName}_div_${instance}` 
    this.divButtonsId  = `plugin_editor_${pluginName}_buttons_${instance}` 

    // Main element
    let div = document.createElement('div');
    div.style.cssText = "display: flex; flex-direction: column; height: inherit;";
    div.innerHTML = `
    <div id="${this.divEditorId}" class="editor_${pluginName}_div" style="flex: 1; /*text-align: center;*/  overflow-y: scroll;"></div>
    <div id="${this.divButtonsId}" class="plugin_editor_${pluginName}_buttons" style="flex: initial; text-align: right; align-self: flex-end; padding: 8px;"></div>
    `;

    let buttons = div.querySelector("#"+this.divButtonsId) as HTMLDivElement;
    let divEditor = div.querySelector("#"+this.divEditorId) as HTMLDivElement;

    if (!buttons) return;
    if (!divEditor) return;

    this.divEditor = divEditor;

    // Create mxWindow
    let win_width = 800;
    let win_height = 640;
    if (editorUi.diagramContainer.clientWidth < win_width) win_width = editorUi.diagramContainer.clientWidth - 20;
    if (editorUi.diagramContainer.clientHeight < win_height) win_height = editorUi.diagramContainer.clientHeight - 20;

    var windowFactory = (options.windowFactory ?? mxWindowFactory)
    var win = new windowFactory(options.title, div, 
      (editorUi.diagramContainer.clientWidth - win_width) / 2 + editorUi.diagramContainer.offsetLeft, 
      (editorUi.diagramContainer.clientHeight - win_height) / 2 + editorUi.diagramContainer.offsetTop, 
      win_width, 
      win_height);

    this.win = win;

    // Cancel button behavior
    var cancelBtn = mxUtils.button(mxResources.get('cancel'), async () => { 
      let cellValue = this.getCellValue().replace(/(\r\n|\n\r)/g,"\n")
      let currentValue = (await this.getEditorValue()).replace(/(\r\n|\n\r)/g,"\n")
      // Check if content has not been changed or ask to discard
      if (  (cellValue == currentValue) ||
          (mxUtils.confirm(mxResources.get('changesNotSaved')+"\n"+mxResources.get('areYouSure')))  ) {
            this.cancel(); 
    }});
    cancelBtn.className = 'geBtn';
    if (editorUi.editor.cancelFirst) {  buttons.appendChild(cancelBtn); }

    // Save without closing button behavior
    var saveBtn = mxUtils.button(mxResources.get('save'), (evt) => { this.validate(false); });
    buttons.appendChild(saveBtn);
    saveBtn.className = 'geBtn';

    // OK button behavior
    var okBtn = mxUtils.button(mxResources.get('saveAndExit'), (evt) => { this.validate(true); });
    buttons.appendChild(okBtn);
    okBtn.className = 'geBtn gePrimaryBtn';
    if (!editorUi.editor.cancelFirst) { buttons.appendChild(cancelBtn); }

    // Prevent drawio keydown listeners to allow cut/copy/paste
    div.addEventListener('keydown', (event) => {
      event.stopPropagation()
    });

    // Call function to add actual editor
    this.onFillWindow();

    // Show Window
    win.show();

    // Call function to focus editor
    this.onShowWindow();
  }


  // Default implementation does nothing
  onFillWindow() {

  }

  // Default implementation does nothing
  onShowWindow() {
    if (this.editorUi && 
        this.editorUi.editor && 
        this.editorUi.editor.graph && 
        this.editorUi.editor.graph.tooltipHandler && 
        this.editorUi.editor.graph.tooltipHandler.hide)
            this.editorUi.editor.graph.tooltipHandler.hide();
  }


  // Default implementation of validate
  async validate(close: boolean = true) {
    let editorUi = this.editorUi;
    if (editorUi.spinner.spin(document.body, mxResources.get('inserting'))) {
      var graph = editorUi.editor.graph;
      graph.getModel().beginUpdate();
      this.setCellValue(await this.getEditorValue());
      graph.getModel().endUpdate();
      graph.refresh(this.cell);
      editorUi.spinner.stop();
      if (this.cell != null) {
        graph.setSelectionCell(this.cell);
        graph.scrollCellToVisible(this.cell);
      }
    }
    if (close) this.win.destroy();
  }

  // Default implementation of cancel
  cancel() {
    this.win.destroy();
  }

  // Default implementation to get editor value, used in default implementation of validate
  async getEditorValue() : Promise<string> {
    return ""  
  }

  // Default implementation to get shape value
  getCellValue() : string {
    if (this.cell)
      return this.cell.getAttribute(this.options.attributeName, '')
    return "";
  }

  // Default implementation to set shape value
  setCellValue(text: string) {
    if (this.cell && this.cell.value) {
        //@ts-ignore  isNode does not require always the node name
        if (mxUtils.isNode(this.cell.value)) {
          this.cell.setAttribute(this.options.attributeName, text);
        }
    }
  }

}


/**
 * BaseEditorPlugin is the instance of the plugin to a specific drawio instance
 * It has also static functions to register items
 */
export class BaseEditorPlugin {

  // Static functions : the collection of plugins instances

  static pluginName: string;
  static options: BaseEditorOptions;
  static pluginInstances: BaseEditorPlugin[] = []
  static instanceWindowCount: number=0;

  static editorWindowClass: BaseEditorWindowClassType;

  static initPlugin(editorWindowClass: BaseEditorWindowClassType, name: string, options : BaseEditorOptions) {
    this.pluginName = name;
    this.editorWindowClass = editorWindowClass;

    this.setOptions(options)

    // Manage options

    // If autoload is not desactivated, we register to load the plugin
    if (this.options.autoload !== false) {
      //@ts-ignore
      Draw.loadPlugin((editorUi: any) => {
        this.registerUi(editorUi);
      })
    }
  }

  static registerUi(editorUi: any) {
    // We create and store a new plugin instance with the UI
    this.pluginInstances.push(Reflect.construct(this, [editorUi]));
  }

  static setOptions(defaultOptions: BaseEditorOptions, overrideOptions?: BaseEditorOptions) {
    let pluginName = BaseEditorPlugin.pluginName
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

    // Default options are provided by the plugin
    let options = defaultOptions

    // Then apply options of defaultEditorsConfig if any (define it in PreConfig.js)
    //@ts-ignore
    let defaultEditorsConfig = window.defaultEditorsConfig;
    if (defaultEditorsConfig && defaultEditorsConfig[pluginName]) {
      options = merge(options, defaultEditorsConfig[pluginName], { arrayMerge: overwriteMerge })
    }

    // Then apply options of local user
    //@ts-ignore
    let userConfig = window.Editor.config;
    if (userConfig && userConfig.defaultEditorsConfig && userConfig.defaultEditorsConfig[pluginName]) {
      options = merge(options, userConfig.defaultEditorsConfig[pluginName], { arrayMerge: overwriteMerge })
    }

    if (!options.title || options.title.length == 0) { options.title = "Editor" }

    // Then override
    if (overrideOptions) options = merge(options, overrideOptions)
    
    this.options = options

  }

  // Instance functions

  editorUi: any;
  staticClass: typeof BaseEditorPlugin;

  constructor(editorUi: any) {
    this.editorUi = editorUi
    this.declareUiFunctions()
  }

  declareUiFunctions() {

    this.staticClass = this.constructor as typeof BaseEditorPlugin
    
    let pluginName = this.staticClass.pluginName
    let options = this.staticClass.options

    let editorUi = this.editorUi;

    // Register Double clic
    if (!options.ignoreDoubleClic) {
      editorUi.editor.graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
        var cell = evt.getProperty("cell");
        if (this.isCellHandled(cell)) { 
          evt.consume();
          this.showDialogCell(cell);
        }
      });
    }

    // Register Contextual
    if (options.contextual && (options.contextual.length > 0)) {
      let prevPopupMethod = editorUi.editor.graph.popupMenuHandler.factoryMethod;
      editorUi.editor.graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => { 
        prevPopupMethod(menu, cell, evt);
        if(this.isCellHandled(cell)) {
          menu.addItem(options.contextual, null, function() { 
            this.showDialogCell(editorUi, cell);
          })
      }}
    }

    // Create Palette Items
    for(let item of options.paletteItems) {

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
         cell.setAttribute(options.attributeName, item.text);
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
      if (cell.getAttribute(this.staticClass.options.attributeName, false) !== false) {
        return true;
      }
    }
    return false;
  }

  showDialogCell(cell: mxCell) {
    let pluginWindow = new this.staticClass.editorWindowClass(this, this.editorUi, cell, this.staticClass.instanceWindowCount++)
  }
  

}



