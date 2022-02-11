/**
 * Strict Mode
 */
'use strict';

const { execSync } = require('child_process');
const { ApiRunnerCommon } = require('./common');
const NavigationCatalog = require('@antora/navigation-builder/lib/navigation-catalog')

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

  event_navigationBuilt(componentVersionData, contentCatalog, bucket, navigationCatalog) {
    if(this.readyToProcess(componentVersionData)) {
      // Inside this block means the generator fired and the files have been loaded into the catalog.
      // Now we have to create the URL in the nav for the item.
      const attachmentsIndex = this.filterContentCatForIndex(contentCatalog, bucket.name, bucket.version);

      for (const page of attachmentsIndex) {
        // Check that a Nav exists already
        if (bucket.navigation === undefined) {
          bucket.navigation = navigationCatalog.addNavigation(bucket.name, bucket.version, [this.createNavObject(page)]);
          // bucket.navigation.push(this.createNavObject(page));
        } else if (bucket.navigation.length === 0) {
          bucket.navigation.push(this.createNavObject(page));
        } else {
          // Add the API Docs index to the page navigation
          bucket.navigation[0].items.unshift(this.createNavObject(page));
        }
      }
    }
  }

  readyToProcess(componentVersionData) {
    if (this.runnerConfig.enabled) {
      if ('successfullyRan' in componentVersionData.extensions.apiDocsGenerator.doxygen &&
        componentVersionData.extensions.apiDocsGenerator.doxygen.successfullyRan){
        return true;
      }
    }

    return false;
  }
}

module.exports = DoxygenRunner;
