var RawSource = require("webpack-core/lib/RawSource");

function ChunkManifestPlugin(options) {
    options = options || {};
    this.manifestFilename = options.filename || "manifest.json";
    this.manifestVariable = options.manifestVariable || "webpackManifest";
    this.inlineManifest = options.inlineManifest || false;
}
module.exports = ChunkManifestPlugin;

ChunkManifestPlugin.prototype.constructor = ChunkManifestPlugin;
ChunkManifestPlugin.prototype.apply = function(compiler) {
    var manifestFilename = this.manifestFilename;
    var manifestVariable = this.manifestVariable;
    var inlineManifest = this.inlineManifest;
    var oldChunkFilename;
    var chunkManifest;

    compiler.plugin("this-compilation", function(compilation) {
        var mainTemplate = compilation.mainTemplate;
        mainTemplate.plugin("require-ensure", function(_, chunk, hash) {

            var filename = compilation.outputOptions.chunkFilename || compilation.outputOptions.filename;
            if (filename) {
                chunkManifest = [chunk].reduce(function registerChunk(manifest, c) {
                    if(c.id in manifest) return manifest;
                    var hasRuntime = typeof c.hasRuntime === 'function' ? c.hasRuntime() : c.entry;
                    if(hasRuntime) {
                        manifest[c.id] = undefined;
                    } else {
                        // In webpack 4 the plugin interface changed, so check for available fns
                        if (compilation.mainTemplate.getAssetPath) {
                            manifest[c.id] = compilation.mainTemplate.hooks.assetPath.call(filename, {
                                hash: hash,
                                chunk: c
                            })
                        } else {
                            manifest[c.id] = mainTemplate.applyPluginsWaterfall("asset-path", filename, {
                                hash: hash,
                                chunk: c
                            });
                        }
                    }
                    return compilation.chunks.reduce(registerChunk, manifest);
                }, {});
                oldChunkFilename = compilation.outputOptions.chunkFilename;
                compilation.outputOptions.chunkFilename = "__CHUNK_MANIFEST__";
                // mark as asset for emitting
                compilation.assets[manifestFilename] = new RawSource(JSON.stringify(chunkManifest));
                chunk.files.push(manifestFilename);
            }

            return _;
        });
    });

    compiler.plugin("compilation", function(compilation) {
        compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash, chunkIdVar) {
            if (oldChunkFilename) {
                compilation.outputOptions.chunkFilename = oldChunkFilename;
            }

            return _.replace("\"__CHUNK_MANIFEST__\"",
                "window[\"" + manifestVariable + "\"][" + chunkIdVar + "]").replace('jsonpScriptSrc(chunkId)',
                "__webpack_require__.p + window[\"" + manifestVariable + "\"][" + chunkIdVar + "]");
        });

        if (inlineManifest){
            compilation.plugin("html-webpack-plugin-before-html-generation", function (data, callback) {
                var manifestHtml = "<script>window." + manifestVariable + "=" + JSON.stringify(chunkManifest) + "</script>";
                callback(null, data.assets[manifestVariable] = manifestHtml);
            });
        }
    });
};
