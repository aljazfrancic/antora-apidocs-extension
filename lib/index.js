/**
 * Strict Mode
 */
"use strict";

const DoxygenRunner = require('./doxygen_runner')
const ApiDocGeneratorConfig = require('./config')

// const { name: packageName } = require('package.json')

function register({config}) {
  const logger = this.getLogger('doxygen-extension')
  
  this
    .on('contentAggregated', async ({contentAggregate}) => {
      for (const componentVersionData of contentAggregate) {
        const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData)
        // console.dir(component, {depth: 1});
        
        if (apiconfig.doxygen.enabled) {
          logger.info('The Doxygen extension is enabled.');
          
          const doxy = new DoxygenRunner(apiconfig.doxygen);
          
          const workingDir = doxy.copyNeededFiles(component);
          doxy.run(workingDir);
          await doxy.loadFiles(componentVersionData, workingDir);
        }
      }
    })
}

function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof (obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}

// module.exports = DoxygenExtension
module.exports = {register}
