/**
 * Strict Mode
 */
'use strict'
const { name: packageName } = require('../package.json')
const FileHandler = require('./filehandler')
const getLogger = require('@antora/logger')
const { execSync } = require('child_process')

class DoxygenRunner {
  constructor (doxyconfig) {
    this.logger = getLogger(packageName)
    this.doxyConfig = doxyconfig
    this.fh = new FileHandler(this.doxyConfig)
  }

  copyNeededFiles (component) {
    const workingDir = this.fh.generateTempWorkingDir(this.doxyConfig)
    this.fh.copyFilesToDir(workingDir, component)
    this.fh.processSpecialtyFiles(workingDir, component)

    return workingDir
  }

  run (workingDir) {
    const defaults = {
      cwd: workingDir,
      maxBuffer: 10 * 1000 * 1024, // 10Mo of logs allowed for module with big npm install
      stdio: 'pipe',
    }

    const resultStdout = execSync(this.doxyConfig.doxygenPath, defaults)

    if (resultStdout) {
      this.logger.info(resultStdout.toString())
    }
  }

  async loadFiles (component, workingDir) {
    const files = await this.fh.readFilesFromWorktree(workingDir, this.doxyConfig.outputFilesBuildDir)
    component.files = component.files.concat(files)

    // dumps the component object to a dir for testing
    // fs.writeFile('file.json', JSON.stringify(component.files, null, 2), (error) => {
    //   if (error) throw error;
    // });
  }
}


module.exports = DoxygenRunner
