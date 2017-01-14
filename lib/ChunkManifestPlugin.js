var RawSource = require("webpack-core/lib/RawSource");

function ChunkManifestPlugin(options) {
  options = options || {};
  this.outputType = options.outputType || "json";
  this.manifestFilename = (options.filename || "manifest") + "." + this.outputType;
  this.manifestVariable = options.manifestVariable || "webpackManifest";
}
module.exports = ChunkManifestPlugin;

ChunkManifestPlugin.prototype.constructor = ChunkManifestPlugin;
ChunkManifestPlugin.prototype.apply = function(compiler) {
  var manifestFilename = this.manifestFilename;
  var manifestVariable = this.manifestVariable;
  var outputType = this.outputType;
  var oldChunkFilename;

  compiler.plugin("this-compilation", function(compilation) {
    var mainTemplate = compilation.mainTemplate;
    mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
      var filename = this.outputOptions.chunkFilename || this.outputOptions.filename;
      var chunkManifest;

      if (filename) {
        chunkManifest = [chunk].reduce(function registerChunk(manifest, c) {
          if(c.id in manifest) return manifest;

          if(c.entry) {
            manifest[c.id] = undefined;
          } else {
            manifest[c.id] = mainTemplate.applyPluginsWaterfall("asset-path", filename, {
              hash: hash,
              chunk: c
            });
          }
          return c.chunks.reduce(registerChunk, manifest);
        }, {});
        oldChunkFilename = this.outputOptions.chunkFilename;
        this.outputOptions.chunkFilename = "__CHUNK_MANIFEST__";
        // mark as asset for emitting
        if (outputType === 'js') {
          fileContents = `window.${manifestVariable} = ${JSON.stringify(chunkManifest)};`;
        } else {
          fileContents = JSON.stringify(chunkManifest);
        }

        compilation.assets[manifestFilename] = new RawSource(fileContents);
      }

      return _;
    });
  });

  compiler.plugin("compilation", function(compilation) {
    compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash, chunkIdVar) {
      if (oldChunkFilename) {
        this.outputOptions.chunkFilename = oldChunkFilename;
      }

      return _.replace("\"__CHUNK_MANIFEST__\"",
        "window[\"" + manifestVariable + "\"][" + chunkIdVar + "]");
    });
  });
};
