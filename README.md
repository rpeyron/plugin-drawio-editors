# Draw.io/diagrams.net multi editors Plugin

This repository is a set of third party editors / viewer embedded in draw.io/diagrams.net for convenience.

Support now:
* Swagger / OpenAPI through swagger-editor
* AsyncApi through asyncapi (playground)
* Markdown through rich-markdown-editor
* HTML with Quill, TinyEditor, TipTap or EditorJS (see limitations in changelog)
* BPMN with BPMN-js editor (from Camunda) - will not work with the official draw.io desktop version (see below)
* JSON Schema (with [json-schema-editor-visual](https://github.com/Open-Federation/json-schema-editor-visual))


## Online Demo
[Online Demo](https://rpeyron.github.io/drawio/src/main/webapp/index.html)

## Usage

You will see a new palette at the bottom left of the screen, in which you will see templates for all loaded editors. Drag and drop one on your graph. Double-click to edit (or right-click and select Edit menu). Click 'Apply' to save the contents to your graph, or 'Close' to close without saving. A property will be added to the item with the saved contents.

## Installation

All editors are available either as standalone plugins, or all bundled in a single plugin. You can choose weither you need only one editor or all. Please note that as all dependancies are packed in the plugin, the resulting files are quite heavy and may take some time to load. 

Note that recent versions of drawio-desktop deactivate by default plugins, so you need to use `--enable-plugins`. In addition, the default Content-Security-Policy (aka CSP) of drawio is very restrictive, so you may need to build your own drawio version with plugins activated and the appropriate CSP corresponding to the plugin you want to use.


1. Open draw.io
2. Select on the top menu bar `Extras`/`Plugins...`
3. click `Add`
4. click `Select File...` for `External Plugins:`
5. select the plugin you want to install
6. click `OK`
7. click `Apply`
8. confirm Dialog

You will need to restart the desktop or reload the page in order to apply


## Configuration

This set of plugins is designed to be highly configurable.

Places where you can configure the plugin:
- in the user's draw.io configuration, through the top menu bar `Extras`/ `Configure` in a `defaultEditorsConfig` entry
- if you are doing a custom build of draw.io, through the PreConfig.js file with declaring a window.defaultEditorsConfig option

The defaultEditorsConfig object's keys should be the plugin names you want to configure. 

All plugins follow then the same configuration structure:
- attributeName (mandatory, string): the name of the property that will hold the contents (example: "swaggerData")
- ignoreDoubleClic (optional, boolean): standard behaviour is to open editor on double click, but you may disable this by setting this parameter to true
- contextual (optional, string): if defined, it will add a menu entry with the provided title in the context menu to open editor (note if you have set ignoreDoubleClic to true, you should really use this parameter)
- title (optional, string): the title of the window of the editor
- autoload (optional, boolean): if false, the plugin won't register to be loaded by drawio and you will need to call registerUi yourself
- maximize (optional, boolean): if true, the window will be maximized
- windowFactory (optional, PluginWindowFactory): if defined, allow to use another windowing system than mxWindow (experimental)
- paletteItems (optional, array of Palette Items configuration): you may define your own palette items that will be used instead of the defaults
- 

Palette items configuration use the following parameters:
- palette (mandatory, string or object): is the name of the palette in which the item should be added ; if the palette does not exist, it is created ; you may provided a label by using an object { name: string, label: string} 
- name (mandatory, string): the technical name of the palette item
- label (optional, string): the label that will be displayed for the palette item ; if not defined, name will be used
- width (optional, number): the width of the palette item
- height (optional, number): the height of the palette item
- data (optional, string): the data of the palette item ; data created with pasting the copied item in https://jgraph.github.io/drawio-tools/tools/convert.html and URL Decode then Encode. When data is used, any other attribute below is ignored.
- icon (optional, string): the data of the icon to display for the item (text to be inserted after 'data:')
- text (optional, string): the default editor contents of the item
- node (optional, string): the string describing the XML of the node to be used. If the attributeName attribute is not defined it will be added.

Example:
`
{
  "defaultEditorsConfig": {
    "swagger": {
      "attributeName": "swagger",
      "paletteItems": [
        {
          "palette": "editor",
          "name": "swagger",
          "text": "use this default text instead"
        }
      ]
    }
  }
}
`

See editor-common.ts comments to get more details, and each plugin code to see their default configuration (more examples)

## Specific information of plugins

### BPML

To be bundled with webpack, the bpmn-js plugin requires that the Content-Security-Policy allow `font-src: data: *`. 
As this is not the case with the version distributed by diagrams.net you must create a custom versionby forking
the drawio repository and change this parameter. If not, the font won't be properly loaded and you will see squares
instead of the tools icons (apart that, the diagram will be displayed and edited correctly)

#### Specific BPML settings

Extra parameters below:
``` 
  config: {
    propertiesPanel: true,    // true to activate properties panel, false to hide it.
  }
```

## How to build

1. `git clone `
2. `cd `
3. `npm install`
4. `npm run build`

## How to develop

You should clone drawio locally to use it as debug version (follow indication in the drawio README). 
You must install manually the plugins before using one of the option below :
* if you are on Linux, you should add a symbolic link from the dist folder to the draw.io plugin folder :`ln -sfr ./dist/xxx-plugin.webpack.js ~/.config/draw.io/plugins/`
* if you are on Windows, there is two helpers npm script 'releas-win' and 'dev-win' that will copy the build plugins in the draw.io plugins folder of your user, and launch drawio in develpment mode

You may want to add '*' to 'default-src' in the meta rule located in the file index.html (line 216 in drawio 14.4.3) to allow loading webpacked resource in development mode.

The plugins are developped in typescript.

Code should be very straight forward:
- common code for all editors is located in editor-common.ts
- a folder is created for each editor to contain the plugin code and all required assets (except the npm modules declared in package.json) ; each plugin :
   * declares a class that inherit from BaseEditor to override the appropriate functions
   * create a new instance with the default settings for this editor

To create a new editor you should:
- create a new folder
- create a new file, a new class inheriting from BaseEditor, and a new instance with the default settings
- add the dependancies to package.json
- add the plugin to webpack.config.js to build the standalone version
- add the plugin to all-editors.js to include it in the bundle

## License

GPL v3.0

Author : Rémi Peyronnet - 2021

# Changelog

# 2023-06-25 - v2.0
- New plugin structure (with breaking changes) to allow multiple instances
# 2023-06-11 - v1.4
- Added Playground to asyncapi plugin
- Fixed dependencies versions

# 2022-10-01 - v1.3
- First version of BPMN-js plugin

# 2022-05-07 - v1.2
- Fixed global config option
- Changed close & apply buttons to avoid losing data by misunderstanding

# 2021-11-06 - v1.1.2
- Replaced the use of mxShape with mxCell

# 2021-11-04 - v1.1.1
- Added global variable to access the plugin

# 2021-10-31 - v1.1 
- Fixed: copy/paste conflict with drawio
- Added: configure custom additional styles for palette item
- Added: advanced configuration abilities with access to customize plugin internals
- Added editors : 
  - Quill : HTML, full toolbar (JSON structure possible, commented)
  - TinyEditor : HTML, default configuration
  - TipTap : HTML, default minimal configuration (no toolbar, no plugins) ; any PR welcome for configuration
  - EditorJS : JSON structure, default minimal configuration

# 2021-04-25 - v1.0 - First public version
- EditorsCommon structure with configuration
- Editors :
  - Markdown editor
  - SwaggerEditor playground
  - AsyncApi viewer only
