var RawSource = require("webpack-core/lib/RawSource");

function ExternalChunkHashesPlugin(options) {
  options = options || {};
  this.manifestFilename = options.filename || "manifest.json";
  this.manifestVariable = options.manifestVariable || "webpackManifest";
}
module.exports = ExternalChunkHashesPlugin;

ExternalChunkHashesPlugin.prototype.constructor = ExternalChunkHashesPlugin;
ExternalChunkHashesPlugin.prototype.apply = function(compiler) {
  var manifestFilename = this.manifestFilename;
  var manifestVariable = this.manifestVariable;

  compiler.plugin("this-compilation", function(compilation) {
    compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
      var filename = this.outputOptions.filename;
      var chunkManifest;

      if (filename) {
        chunkManifest = [chunk].reduce(function registerChunk(manifest, c) {
          if(c.name in manifest) return manifest;

          if(c.entry) {
            manifest[c.name] = undefined;
          } else {
            manifest[c.name] = compilation.applyPluginsWaterfall("asset-path", filename, {
              hash: hash,
              chunk: c
            });
          }
          return c.chunks.reduce(registerChunk, manifest);
        }, {});
        this.outputOptions.chunkFilename = "__ENTRY_MANIFEST__";
        // mark as asset for emitting
        compilation.assets[manifestFilename] = new RawSource(JSON.stringify(chunkManifest));
      }

      return _;
    });
  });

  compiler.plugin("compilation", function(compilation) {
    compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash, chunkIdVar) {
      return _.replace("\"__ENTRY_MANIFEST__\"",
        "window[\"" + manifestVariable + "\"][" + chunkIdVar + "]");
    });
  });
};
