/**
 * Strict Mode
 */
'use strict';

const { execSync } = require('child_process');
const ApiRunnerCommon = require('./common');

class DoxygenRunner extends ApiRunnerCommon {
  constructor(doxyconfig) {
    super(doxyconfig);
  }

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
      this.logger.info('The Doxygen extension is enabled.');

      console.log('Doxygen:' + componentVersionData.name + '- Copying files to the temp location.');
      const workingDir = this.copyNeededFiles(componentVersionData);

      console.log('Doxygen:' + componentVersionData.name + '- Running Doxygen.');
      this.runDoxygen(workingDir);

      console.log('Doxygen:' + componentVersionData.name + '- Loading the Doxygen result into the bucket.');
      await this.loadFiles(componentVersionData, workingDir);

      // Set the flag saying it happened
      componentVersionData.extensions.apiDocsGenerator.doxygen['successfullyRan'] = true;
    }
  }

  event_navigationBuilt(componentVersionData, contentCatalog, component, version, nav) {
    if (this.runnerConfig.enabled) {
      if ('successfullyRan' in componentVersionData.extensions.apiDocsGenerator.doxygen &&
        componentVersionData.extensions.apiDocsGenerator.doxygen.successfullyRan) {
        // Inside this block means the generator fired and the files have been loaded into the catalog.
        // Now we have to create the URL in the nav for the item.
        const attachmentsIndex = this.filterContentCatForIndex(contentCatalog, component, version);

        for (const page of attachmentsIndex) {
          // Check that a Nav exists already
          if (nav.length === 0) {
            nav.push(this.createNavObject(page));
          } else {
            // Add the API Docs index to the page navigation
            nav[0].items.unshift(this.createNavObject(page));
          }
        }
      }
    }
  }
}

module.exports = DoxygenRunner;
