/**
 * Strict Mode
 */
'use strict';

const { execSync } = require('child_process');
const { ApiRunnerCommon, genVersionNameKey, addUrlToTopOfNav } = require('./common');

class DoxygenRunner extends ApiRunnerCommon {

  runDoxygen(workingDir) {
    const defaults = {
      cwd: workingDir,
      maxBuffer: 10 * 1000 * 1024, // 10Mo of logs allowed for module with big npm install
      stdio: 'pipe',
    };

    const resultStdout = execSync(this.runnerConfig.doxygenPath, defaults);

    if (resultStdout) {
      this.logger.info(resultStdout.toString());
    }
  }

  async event_contentAggregated(componentVersionData) {
    if (this.runnerConfig.enabled) {
      console.log('Doxygen:' + componentVersionData.name + '- The Doxygen extension is enabled.');

      console.log('Doxygen:' + componentVersionData.name + '- Copying files to the temp location.');
      const workingDir = this.copyNeededFiles(componentVersionData);

      console.log('Doxygen:' + componentVersionData.name + '- Running Doxygen.');
      this.runDoxygen(workingDir);

      console.log('Doxygen:' + componentVersionData.name + '- Loading the Doxygen result into the bucket.');
      await this.loadFiles(componentVersionData, workingDir);

      return true;
    }
    return false;
  }

  event_navigationBuilt(contentCatalog, componentVersion, navigationCatalog, doxygenExtensionResult) {
    if (doxygenExtensionResult[genVersionNameKey(componentVersion)]) {
      // Inside this block means the generator fired and the files have been loaded into the catalog.
      // Now we have to create the URL in the nav for the item.
      const attachmentsIndex = this.filterContentCatForIndex(contentCatalog, componentVersion.name, componentVersion.version);
      addUrlToTopOfNav(attachmentsIndex, componentVersion, navigationCatalog, this.runnerConfig.apiDocsLinkText);
    }
  }
}

module.exports = DoxygenRunner;
