// tslint:disable:no-var-requires
const typescript = require('rollup-plugin-typescript2')
const resolve = require('rollup-plugin-node-resolve')
const bublePlugin = require('rollup-plugin-buble')
const uglify = require('rollup-plugin-uglify')
const optimizeJs = require('optimize-js')
const babel = require('rollup-plugin-babel')
const es3 = require('rollup-plugin-es3')
// const replace = require('rollup-plugin-re')

const optJSPlugin = {
  name: 'optimizeJs',

  transformBundle (code) {
    return optimizeJs(code, {
      sourceMap: false,
      sourceType: 'module'
    })
  }
}

const babelPlugin = babel({
  babelrc: false,
  presets: ['es3']
})

const uglifyPlugin = uglify({
  compress: {
    // compress options
    booleans: true,
    dead_code: true,
    drop_debugger: true,
    unused: true
  },
  ie8: true,
  parse: {
    // parse options
    html5_comments: false,
    shebang: false
  },
  sourceMap: false,
  toplevel: false,
  warnings: false
})

const baseConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/nerv.js',
    format: 'umd',
    name: 'Nerv',
    sourcemap: true
  },
  plugins: [
    resolve(),
    typescript({
      include: 'src/**',
      typescript: require('typescript')
    }),
    bublePlugin(),
    babelPlugin,
    es3(['defineProperty', 'freeze'])
  ]
}

const esmConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    format: 'es',
    file: 'dist/nerv.esm.js'
  }
}

const productionConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    file: 'dist/nerv.min.js',
    sourcemap: false
  },
  plugins: baseConfig.plugins.concat([
    uglifyPlugin,
    optJSPlugin
  ])
}

const devtoolConfig = {
  input: 'devtools/index.ts',
  output: {
    sourcemap: true,
    name: 'nerv-devtools',
    format: 'umd',
    file: 'devtools.js'
  },
  external: ['nervjs'],
  globals: {
    'nervjs': 'Nerv'
  },
  plugins: [
    typescript({
      include: 'devtools/**',
      typescript: require('typescript')
    })
  ]
}

function rollup () {
  const target = process.env.TARGET
  if (target === 'umd') {
    return baseConfig
  } else if (target === 'esm') {
    return esmConfig
  } else if (target === 'devtools') {
    return devtoolConfig
  } else {
    return [baseConfig, esmConfig, productionConfig, devtoolConfig]
  }
}

export default rollup()