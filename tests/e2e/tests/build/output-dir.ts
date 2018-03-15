import {getGlobalVariable} from '../../utils/env';
import {expectFileToExist} from '../../utils/fs';
import {expectGitToBeClean} from '../../utils/git';
import {ng} from '../../utils/process';
import {updateJsonFile} from '../../utils/project';
import {expectToFail} from '../../utils/utils';


export default function() {
  // TODO(architect): Delete this test. It is now in devkit/build-webpack.

  // Skip this in ejected tests.
  if (getGlobalVariable('argv').eject) {
    return Promise.resolve();
  }

  return ng('build', '--output-path', '../build-output')
    .then(() => expectFileToExist('./build-output/index.html'))
    .then(() => expectFileToExist('./build-output/main.js'))
    .then(() => expectToFail(expectGitToBeClean))
    .then(() => updateJsonFile('.angular-cli.json', configJson => {
      const app = configJson['apps'][0];
      app['outDir'] = 'config-build-output';
    }))
    .then(() => ng('build'))
    .then(() => expectFileToExist('./config-build-output/index.html'))
    .then(() => expectFileToExist('./config-build-output/main.js'))
    .then(() => expectToFail(expectGitToBeClean));
}
