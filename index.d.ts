import { Plugin } from 'webpack';

interface ChunkManifestPluginOptions {
  /**
   * Where the manifest will be exported to on bundle compilation.
   * This will be relative to the main webpack output directory.
   * Default = "manifest.json".
   */
  filename?: string;
  /**
   * What JS variable on the client webpack should refer to when requiring chunks.
   * Default = "webpackManifest".
   */
  manifestVariable?: string;
  /**
   * Whether or not to write the manifest output into the html-webpack-plugin.
   * Default = false.
   */
  inlineManifest?: boolean;
}
interface ChunkManifestPlugin {
  new (options?: ChunkManifestPluginOptions): Plugin;
}

declare const chunkManifestPlugin: ChunkManifestPlugin
export = chunkManifestPlugin

