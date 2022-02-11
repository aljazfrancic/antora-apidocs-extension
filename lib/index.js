/**
 * Strict Mode
 */
'use strict';

const DoxygenRunner = require('./doxygen_runner');
const ApiDocGeneratorConfig = require('./config');

function register({ config }) {
  this
    // eslint-disable-next-line space-before-function-paren
    .on('contentAggregated', async ({ contentAggregate }) => {
      for (const componentVersionData of contentAggregate) {
        // console.dir(component, {depth: 1});

        const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);
        const doxy = new DoxygenRunner(apiconfig.doxygen);

        await doxy.event_contentAggregated(componentVersionData);

        // in case one of the runners update the config, go ahead and save it to the app context
        this.updateVariables({ componentVersionData });
      }
    })
    .on('navigationBuilt', ({ contentCatalog, componentVersionData, navigationCatalog }) => {
      contentCatalog.getComponents().forEach(({ versions }) => {
        for (let bucket of versions) {
          const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);
          const doxy = new DoxygenRunner(apiconfig.doxygen);

          doxy.event_navigationBuilt(componentVersionData, contentCatalog, bucket, navigationCatalog);
        }
      });
    });
}

module.exports = { register };
