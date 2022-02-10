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
    .on('navigationBuilt', ({ contentCatalog, componentVersionData }) => {
      contentCatalog.getComponents().forEach(({ versions }) => {
        versions.forEach(({ name: component, version, navigation: nav, url: defaultUrl }) => {
          const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);
          const doxy = new DoxygenRunner(apiconfig.doxygen);
          doxy.event_navigationBuilt(componentVersionData, contentCatalog, component, version, nav);
        });
      });
    });
}

module.exports = { register };
