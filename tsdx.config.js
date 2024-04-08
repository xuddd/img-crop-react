const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
              preset: 'default',
          }),
        ],
        inject: true,
        extract: !!options.writeMeta,
        camelCase: true, // 支持驼峰
        less: true,
      })
    );

    return config;
  },
};
