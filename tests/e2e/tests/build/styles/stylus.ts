import {
  writeMultipleFiles,
  deleteFile,
  expectFileToMatch,
  replaceInFile
} from '../../../utils/fs';
import { expectToFail } from '../../../utils/utils';
import { ng } from '../../../utils/process';
import { stripIndents } from 'common-tags';
import { updateJsonFile } from '../../../utils/project';

export default function () {
  // TODO(architect): Delete this test. It is now in devkit/build-webpack.

  return writeMultipleFiles({
    'src/styles.styl': stripIndents`
      @import './imported-styles.styl';
      body { background-color: blue; }
    `,
    'src/imported-styles.styl': stripIndents`
      p { background-color: red; }
    `,
    'src/app/app.component.styl': stripIndents`
        .outer {
          .inner {
            background: #fff;
          }
        }
      `})
    .then(() => deleteFile('src/app/app.component.css'))
    .then(() => updateJsonFile('.angular-cli.json', configJson => {
      const app = configJson['apps'][0];
      app['styles'] = ['styles.styl'];
    }))
    .then(() => replaceInFile('src/app/app.component.ts',
      './app.component.css', './app.component.styl'))
    .then(() => ng('build', '--extract-css', '--source-map'))
    .then(() => expectFileToMatch('dist/styles.css',
      /body\s*{\s*background-color: #00f;\s*}/))
    .then(() => expectFileToMatch('dist/styles.css',
      /p\s*{\s*background-color: #f00;\s*}/))
    .then(() => expectToFail(() => expectFileToMatch('dist/styles.css', '"mappings":""')))
    .then(() => expectFileToMatch('dist/main.js', /.outer.*.inner.*background:\s*#[fF]+/));
}
