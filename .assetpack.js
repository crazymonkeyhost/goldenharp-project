import { pixiManifest } from '@assetpack/core/manifest';
import { texturePacker } from '@assetpack/core/texture-packer';
import { compress } from '@assetpack/core/image';
import { spineAtlasCompress } from '@assetpack/core/spine';
import { texturePackerCompress } from "@assetpack/core/texture-packer";

import { mipmap } from '@assetpack/core/image';
import { spineAtlasMipmap } from "@assetpack/core/spine";

const compressOptions = {
  jpg: {},
  png: { quality: 100 },
  webp: { quality: 100 },
  avif: false,
  bc7: false,
  astc: false,
  basis: false,
};

const mipmapOptions = {      template: "@%%x",
  resolutions: { default: 1,/* low: 0.5*/ }, // { high: 2, default: 1, low: 0.5 }
  fixedResolution: "default",}

export default {
  entry: './assets-raw',
  output: './public/assets',
  pipes: [
    pixiManifest({
      output: 'manifest.json',
      createShortcuts: true,
      trimExtensions: true,
      includeMetaData: false,
    }),

    mipmap(mipmapOptions),
    spineAtlasMipmap(mipmapOptions),

    texturePacker({
      texturePacker: {
        padding: 2,
        nameStyle: 'relative',
        removeFileExtension: true,
      },
      resolutionOptions: {
        ...mipmapOptions,
        // template: '@%%x',
        // resolutions: { default: 1 },
        // fixedResolution: "default",
        maximumTextureSize: 4096,
      },
    }),

    // compress(compressOptions),
    // spineAtlasCompress(compressOptions),
    // texturePackerCompress(compressOptions),
  ],
};
