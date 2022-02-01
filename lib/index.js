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
    .on('contentAggregated', ({contentAggregate}) => {
      contentAggregate.forEach(component => {
  
        const apiconfig = new ApiDocGeneratorConfig(config, component)
  
        // console.dir(content, {depth: 1});

        if (apiconfig.doxygen.enabled){
          logger.info('The Doxygen extension is enabled.');
          
          const doxy = new DoxygenRunner();
          const workingDir = doxy.copyNeededFiles(config, component);
        }
        
        
        // console.dir(component, {depth: 0});
        // const {name, files} = component;
        //
        // logger.warn("content name: " + name);
        //
        // files.forEach(file => {
        //   logger.warn(file.path)
        //   // console.dir(file.src, {depth: 0});
        // })
      })
      // logger.warn("content files: " + files);
    })
  // .on('contentClassified', ({contentCatalog}) => {
  // contentCatalog.getComponents().forEach(({versions}) => {
  //   versions.forEach(({name: component, version, navigation: nav, url: defaultUrl}) => {
  //     logger.warn("Component Name: " + component)
  //   })
  // })
  // })
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
