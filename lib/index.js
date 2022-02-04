/**
 * Strict Mode
 */
'use strict'

const DoxygenRunner = require('./doxygen_runner')
const ApiDocGeneratorConfig = require('./config')
const { name: packageName } = require('../package.json')

// const { name: packageName } = require('package.json')

function register ({ config }) {
  const logger = this.getLogger(packageName)

  this.on('contentAggregated', async ({ contentAggregate }) => {
    for (const componentVersionData of contentAggregate) {
      const apiconfig = new ApiDocGeneratorConfig(config, componentVersionData)
      // console.dir(component, {depth: 1});

      if (apiconfig.doxygen.enabled) {
        logger.info('The Doxygen extension is enabled.')

        const doxy = new DoxygenRunner(apiconfig.doxygen)

        console.log('Doxygen - Copying files to the temp location.')
        const workingDir = doxy.copyNeededFiles(componentVersionData)

        console.log('Doxygen - Running Doxygen.')
        doxy.run(workingDir)

        console.log('Doxygen - Loading the Doxygen result into the bucket.')
        await doxy.loadFiles(componentVersionData, workingDir)
      }
    }
  })
}

module.exports = { register }
