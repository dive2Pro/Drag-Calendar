import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'
import scss from 'rollup-plugin-scss'
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import postcssModules from 'postcss-modules'
const cssExportMap = {}
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    name: 'lib'
  },
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    scss(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    }),
    postcss({
      // plugins: [
      //   // postcssModules({
      //   //   getJSON(id, exportToken) {
      //   //     cssExportMap[id] = exportToken
      //   //   }
      //   // })
      // ],
      // getExportNamed: false,
      // getExport(id) {
      //   return cssExportMap[id]
      // },
      extract: 'dist/styles.css'
    }),
    commonjs({
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/react-dnd/index.js': [ 'default' ],
        "react-dnd": ["DragSource", "DropTarget", "DragLayer"],
        "react": ["PureComponent", "Component", "Children"],
        "react-dom": ["createPortal", "findDOMNode"]
      }
    })
  ]
}