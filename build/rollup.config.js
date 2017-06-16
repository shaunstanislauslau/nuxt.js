// Some parts brought from https://github.com/vuejs/vue/blob/dev/build/config.js
const { resolve } = require('path')
const rollupBabel = require('rollup-plugin-babel')
const rollupAlias = require('rollup-plugin-alias')
const rollupCommonJS = require('rollup-plugin-commonjs')
const rollupReplace = require('rollup-plugin-replace')
const rollupResolve = require('rollup-plugin-node-resolve')
const packageJson = require('../package.json')

const dependencies = Object.keys(packageJson.dependencies)
const version = packageJson.version || process.env.VERSION

// -----------------------------
// Banner
// -----------------------------
const banner =
  '/*!\n' +
  ' * Nuxt.js v' + version + '\n' +
  ' * Released under the MIT License.\n' +
  ' */'


// -----------------------------
// Aliases
// -----------------------------
const rootDir = resolve(__dirname, '..')
const srcDir = resolve(rootDir, 'src')
const distDir = resolve(rootDir, 'dist')

const aliases = {
  core: resolve(srcDir, 'core/index.js'),
  builder: resolve(srcDir, 'builder/index.js'),
  common: resolve(srcDir, 'common/index.js'),
  utils: resolve(srcDir, 'common/utils.js'),
  app: resolve(srcDir, 'app'),
}

// -----------------------------
// Builds
// -----------------------------
const builds = {
  core: {
    entry: resolve(srcDir, 'core/index.js'),
    dest: resolve(distDir, 'core.js')
  },
  builder: {
    entry: resolve(srcDir, 'builder/index.js'),
    dest: resolve(distDir, 'builder.js')
  }
}

// -----------------------------
// Default config
// -----------------------------
function genConfig (opts) {
  const config = {
    entry: opts.entry,
    dest: opts.dest,
    external: ['fs', 'path'].concat(dependencies, opts.external),
    format: opts.format || 'cjs',
    banner: opts.banner || banner,
    moduleName: opts.moduleName || 'Nuxt',
    sourceMap: true,
    plugins: [
      rollupAlias(Object.assign({
        resolve: ['.js', '.json', '.jsx', '.ts']
      }, aliases, opts.alias)),

      rollupCommonJS(),

      rollupResolve({ jsnext: true }),

      rollupBabel(Object.assign({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        plugins: [
          ['transform-runtime', { 'helpers': false, 'polyfill': false }],
          'transform-async-to-generator',
          'array-includes'
        ],
        presets: [
          'babel-preset-es2015-rollup'
        ]
      }, opts.babel)),

      rollupReplace({
        __VERSION__: version
      })
    ].concat(opts.plugins || [])
  }

  if (opts.env) {
    config.plugins.push(rollupReplace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(builds[process.env.TARGET])
} else {
  exports.getBuild = name => genConfig(builds[name])
  exports.getAllBuilds = () => Object.keys(builds).map(name => genConfig(builds[name]))
}
