/**
 * Strict Mode
 */
'use strict';

const DoxygenRunner = require('./doxygen_runner');
const ApiDocGeneratorConfig = require('./config');
const { genVersionNameKey } = require('./common');
const getLogger = require('@antora/logger');
const { name: packageName } = require("../package.json");

function register({ config }) {
  const logger = getLogger(packageName);

  this
    // eslint-disable-next-line space-before-function-paren
    .on('contentAggregated', async ({ contentAggregate }) => {

      var doxygenExtensionResult = {};

      for (const componentVersionData of contentAggregate) {
        const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);
        const doxy = new DoxygenRunner(apiconfig.doxygen);

        // in case one of the runners update the config, go ahead and save it to the app context
        doxygenExtensionResult[genVersionNameKey(componentVersionData)] = await doxy.event_contentAggregated(componentVersionData);

        this.updateVariables({ doxygenExtensionResult });
      }
    })
    .on('navigationBuilt', ({ contentCatalog, navigationCatalog, doxygenExtensionResult }) => {
      /**
       * doxygenExtensionResult is the results from the contentAggregated event.  It has the model of
       * {
       *   version@name: bool
       * }
       *
       * the boolean indicates if it should update the Nav for the
       */
      contentCatalog.getComponents().forEach(({ versions }) => {

        for (let componentVersion of versions) {
          const apiconfig = new ApiDocGeneratorConfig(config, componentVersion);
          const doxy = new DoxygenRunner(apiconfig.doxygen);

          doxy.event_navigationBuilt(contentCatalog, componentVersion, navigationCatalog, doxygenExtensionResult);
        }
      });
    });
}

module.exports = { register };
