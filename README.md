# chunk-manifest-webpack-plugin

Allows exporting a JSON file that maps chunk ids to their resulting asset files. Webpack can then read this mapping, assuming it is provided somehow on the client, instead of storing a mapping (with chunk asset hashes) in the bootstrap script, which allows to actually leverage long-term caching.

## Usage

Install via npm:

```shell
npm install chunk-manifest-webpack-plugin
```

And then require and provide to webpack:

```javascript
// in webpack.config.js or similar
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

module.exports = {
  // your config values here
  plugins: [
    new ChunkManifestPlugin({
      filename: "manifest.json",
      manifestVariable: "webpackManifest"
    })
  ]
};
```

Currently this plugin is also dependent on the [webpack-md5-hash](https://github.com/erm0l0v/webpack-md5-hash) webpack plugin to work properly. Install that plugin as well (`npm install webpack-md5-hash`) and include it in your webpack plugins list (`new WebpackMd5Hash()`).

### Options

#### `filename`

Where the manifest will be exported to on bundle compilation. This will be relative to the main webpack output directory. Default = `"manifest.json"`

#### `manifestVariable`

What JS variable on the client webpack should refer to when requiring chunks. Default = `"webpackManifest"`
