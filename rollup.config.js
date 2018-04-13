import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'
import scss from 'rollup-plugin-scss'
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
    paths: 'dist'
  },
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    scss(),
    babel({
      exclude: 'node_modules/**'
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