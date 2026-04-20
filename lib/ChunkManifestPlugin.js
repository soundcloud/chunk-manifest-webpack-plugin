const pluginName = 'ChunkManifestPlugin';

class ChunkManifestPlugin {
  constructor(options) {
    this.options = {
      filename: 'manifest.json',
      manifestVariable: 'webpackManifest',
      inlineManifest: false,
      ...options,
    };
  }

  apply(compiler) {
    const chunkManifestFilename = '__CHUNK_MANIFEST__';
    let chunkManifest;
    let oldChunkFilename;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const {mainTemplate} = compilation;

      mainTemplate.hooks.requireEnsure.tap(
        pluginName,
        (source, chunk, hash) => {
          const {outputOptions} = mainTemplate;
          const filename =
            outputOptions.chunkFilename || outputOptions.filename;

          if (filename) {
            const registerChunk = (manifest, chunk) => {
              if (chunk.id in manifest) {
                return manifest;
              }

              if (chunk.hasRuntime()) {
                manifest[chunk.id] = undefined;
              } else {
                manifest[chunk.id] = mainTemplate.getAssetPath(filename, {
                  hash,
                  chunk,
                });
              }

              return Array.from(chunk.getAllAsyncChunks()).reduce(
                registerChunk,
                manifest,
              );
            };
            chunkManifest = registerChunk({}, chunk);

            oldChunkFilename = outputOptions.chunkFilename;
            outputOptions.chunkFilename = chunkManifestFilename;

            const source = JSON.stringify(chunkManifest, null, true);
            compilation.assets[this.options.filename] = {
              source: () => source,
              size: () => source.length,
            };
            chunk.files.push(this.options.filename);
          }

          return source;
        },
      );
    });

    compiler.hooks.compilation.tap(pluginName, compilation => {
      const {mainTemplate} = compilation;

      mainTemplate.hooks.requireEnsure.tap(
        pluginName,
        (source, chunk, hash, chunkId) => {
          if (oldChunkFilename) {
            mainTemplate.outputOptions.chunkFilename = oldChunkFilename;

            return source.replace(
              `"${chunkManifestFilename}"`,
              `window['${this.options.manifestVariable}']['${chunkId}']`,
            );
          }
        },
      );

      if (this.options.inlineManifest) {
        const {htmlWebpackPluginBeforeHtmlGeneration} = compilation.hooks;

        if (htmlWebpackPluginBeforeHtmlGeneration) {
          const {manifestVariable} = this.options;

          htmlWebpackPluginBeforeHtmlGeneration.tap(pluginName, data => {
            const manifestHtml = `<script>window.${manifestVariable}=${JSON.stringify(chunkManifest)}</script>`;
            return data.assets[manifestVariable] = manifestHtml;
          });
        }
      }
    });
  }
}

module.exports = ChunkManifestPlugin;
