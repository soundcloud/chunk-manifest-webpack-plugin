# entry-manifest-webpack-plugin

Allows exporting a JSON file that maps entry resource names to their resulting asset files. Webpack can then read this mapping (assuming it is provided to webpack somehow on the client) from here instead of storing the mapping in its bootstrap, which allows to actually leverage long-term caching of the bootstrap file.

## Usage

Install via npm:

```shell
npm install entry-manifest-webpack-plugin
```

And then require and provide to webpack:

```javascript
// in webpack.config.js or similar
var EntryManifestPlugin = require('entry-manifest-webpack-plugin');

module.exports = {
  // your config values here
  plugins: [
    new EntryManifestPlugin({
      filename: "manifest.json",
      manifestVariable: "webpackManifest"
    })
  ]
};
```

### Options

#### `filename`

Where the manifest will be exported to on bundle compilation. This will be relative to the main webpack output directory. Default = `"manifest.json"`

#### `manifestVariable`

What JS variable on the client webpack should refer to when requiring entry chunks. Default = `"webpackManifest"`
