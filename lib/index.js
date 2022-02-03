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

        // console.log(Array.isArray(component.files))
        // console.dir(component, {depth: 1});
        // console.dir(component.files, {depth: 0});

        if (apiconfig.doxygen.enabled){
          logger.info('The Doxygen extension is enabled.');

          const doxy = new DoxygenRunner(apiconfig.doxygen);

          // const workingDir = doxy.copyNeededFiles(component);
          // doxy.run(workingDir);
          // component.files.forEach(file => {
          //   console.dir(file);
          // });
          doxy.loadFiles(component,"/tmp/a5a79f17-4e29-44e6-98eb-46fdab5630cd");

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
      logger.warn("content files: " + files);
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
