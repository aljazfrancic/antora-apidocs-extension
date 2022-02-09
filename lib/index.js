/**
 * Strict Mode
 */
'use strict';

const DoxygenRunner = require('./doxygen_runner');
const ApiDocGeneratorConfig = require('./config');
const {name: packageName} = require('../package.json');

// const { name: packageName } = require('package.json')

function register({config}) {
  const logger = this.getLogger(packageName);
  
  this
    .on('contentAggregated', async ({contentAggregate}) => {
      for (const componentVersionData of contentAggregate) {
        const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);
        // console.dir(component, {depth: 1});
        
        if (apiconfig.doxygen.enabled) {
          logger.info('The Doxygen extension is enabled.');
          
          const doxy = new DoxygenRunner(apiconfig.doxygen);
          
          console.log('Doxygen:' + componentVersionData.name + '- Copying files to the temp location.');
          const workingDir = doxy.copyNeededFiles(componentVersionData);
          
          console.log('Doxygen:' + componentVersionData.name + '- Running Doxygen.');
          doxy.run(workingDir);
          
          console.log('Doxygen:' + componentVersionData.name + '- Loading the Doxygen result into the bucket.');
          await doxy.loadFiles(componentVersionData, workingDir);
          
          componentVersionData.extensions.apiDocsGenerator.doxygen["successfullyRan"] = true;
          this.updateVariables({componentVersionData});
          
        }
      }
    })
    .on('navigationBuilt', ({contentCatalog, componentVersionData}) => {
      contentCatalog.getComponents().forEach(({versions}) => {
        versions.forEach(({name: component, version, navigation: nav, url: defaultUrl}) => {
          const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData);

          if (apiconfig.doxygen.enabled) {
            if ('successfullyRan' in componentVersionData.extensions.apiDocsGenerator.doxygen &&
              componentVersionData.extensions.apiDocsGenerator.doxygen.successfullyRan) {
              // Inside this block means the generator fired and the files have been loaded into the catalog.
              // Now we have to create the URL in the nav for the item.
              const attachmentsIndex = filterContentCatForIndex(contentCatalog, apiconfig, component, version);

              for (const page of attachmentsIndex) {
                // Check that a Nav exists already
                if (nav.length === 0) {
                  nav.push(createNavObject(apiconfig, page));
                } else {
                  // Add the API Docs index to the page navigation
                  nav[0].items.unshift(createNavObject(apiconfig, page));
                }
              }
            }
          }
        });
      });
    });
}

function filterContentCatForIndex(contentCatalog, apiconfig, component, version) {
  return contentCatalog
    .findBy({component, version, family: 'attachment'})
    .filter((page) => page.out)
    .filter((page) => {
      if (page.src.path.endsWith(apiconfig.doxygen.attachmentDir + "/" + apiconfig.doxygen.indexFilename)) {
        return page;
      }
    });
}

function createNavObject(apiconfig, page) {
  return {
    content: apiconfig.doxygen.apiDocsLinkText,
    url: page.pub.url,
    urlType: 'internal',
    order: 0
  };
}

module.exports = {register};
