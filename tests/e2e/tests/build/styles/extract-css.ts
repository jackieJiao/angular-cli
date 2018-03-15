import {
  writeMultipleFiles,
  expectFileToExist,
  expectFileToMatch
} from '../../../utils/fs';
import { ng } from '../../../utils/process';
import { updateJsonFile } from '../../../utils/project';
import { expectToFail } from '../../../utils/utils';
import { oneLineTrim } from 'common-tags';

export default function () {
  // TODO(architect): Delete this test. It is now in devkit/build-webpack.

  return Promise.resolve()
    .then(() => writeMultipleFiles({
      'src/string-style.css': '.string-style { color: red }',
      'src/input-style.css': '.input-style { color: red }',
      'src/lazy-style.css': '.lazy-style { color: red }',
      'src/pre-rename-style.css': '.pre-rename-style { color: red }',
      'src/pre-rename-lazy-style.css': '.pre-rename-lazy-style { color: red }'
    }))
    .then(() => updateJsonFile('.angular-cli.json', configJson => {
      const app = configJson['apps'][0];
      app['styles'] = [
        'string-style.css',
        { input: 'input-style.css' },
        { input: 'lazy-style.css', lazy: true },
        { input: 'pre-rename-style.css', output: 'renamed-style' },
        { input: 'pre-rename-lazy-style.css', output: 'renamed-lazy-style', lazy: true }
      ];
    }))
    .then(() => ng('build', '--extract-css'))
    // files were created successfully
    .then(() => expectFileToMatch('dist/styles.css', '.string-style'))
    .then(() => expectFileToMatch('dist/styles.css', '.input-style'))
    .then(() => expectFileToMatch('dist/lazy-style.css', '.lazy-style'))
    .then(() => expectFileToMatch('dist/renamed-style.css', '.pre-rename-style'))
    .then(() => expectFileToMatch('dist/renamed-lazy-style.css', '.pre-rename-lazy-style'))
    // there are no js entry points for css only bundles
    .then(() => expectToFail(() => expectFileToExist('dist/style.js')))
    .then(() => expectToFail(() => expectFileToExist('dist/lazy-style.js')))
    .then(() => expectToFail(() => expectFileToExist('dist/renamed-style.js')))
    .then(() => expectToFail(() => expectFileToExist('dist/renamed-lazy-style.js')))
    // index.html lists the right bundles
    .then(() => expectFileToMatch('dist/index.html', new RegExp(oneLineTrim`
      <link rel="stylesheet" href="styles\.css"/?>
      <link rel="stylesheet" href="renamed-style\.css"/?>
    `)))
    .then(() => expectFileToMatch('dist/index.html', oneLineTrim`
      <script type="text/javascript" src="runtime.js"></script>
      <script type="text/javascript" src="polyfills.js"></script>
      <script type="text/javascript" src="vendor.js"></script>
      <script type="text/javascript" src="main.js"></script>
    `))
    // also check when css isn't extracted
    .then(() => ng('build', '--no-extract-css'))
    // files were created successfully
    .then(() => expectFileToMatch('dist/styles.js', '.string-style'))
    .then(() => expectFileToMatch('dist/styles.js', '.input-style'))
    .then(() => expectFileToMatch('dist/lazy-style.js', '.lazy-style'))
    .then(() => expectFileToMatch('dist/renamed-style.js', '.pre-rename-style'))
    .then(() => expectFileToMatch('dist/renamed-lazy-style.js', '.pre-rename-lazy-style'))
    // index.html lists the right bundles
    .then(() => expectFileToMatch('dist/index.html', oneLineTrim`
      <script type="text/javascript" src="runtime.js"></script>
      <script type="text/javascript" src="polyfills.js"></script>
      <script type="text/javascript" src="styles.js"></script>
      <script type="text/javascript" src="renamed-style.js"></script>
      <script type="text/javascript" src="vendor.js"></script>
      <script type="text/javascript" src="main.js"></script>
    `));
}
