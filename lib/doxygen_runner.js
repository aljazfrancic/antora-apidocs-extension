/**
 * Strict Mode
 */
"use strict";

const FileHandler = require('./filehandler');
const getLogger = require('@antora/logger')
const {exec} = require('child_process');
const fs = require("fs");


// 'docs/modules/ROOT/attachments/cdocs'
class DoxygenRunner {
  
  constructor(doxyconfig) {
    this.logger = getLogger('doxygen-extension')
    this.doxyConfig = doxyconfig
    this.fh = new FileHandler(this.doxyConfig);
  }
  
  copyNeededFiles(component) {
    var workingDir = this.fh.generateTempWorkingDir(this.doxyConfig);
    this.fh.copyFilesToDir(workingDir, component);
    this.fh.processSpecialtyFiles(workingDir, component)
    
    return workingDir;
  }
  
  run(workingDir) {
    
    const defaults = {
      cwd: workingDir
    };
    
    exec(this.doxyConfig.doxygenPath, defaults, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`exec error: ${error}`);
        return;
      }
      
      if (stdout) {
        this.logger.info(stdout);
      }
      
      if (stderr) {
        this.logger.error(stderr);
      }
    });
    
    // this.logger.info(exec( path.resolve(configPath)));
  }
  
  async loadFiles(component, workingDir) {
    var files = await this.fh.readFilesFromWorktree(workingDir, "build");
    component.files = component.files.concat(files);
  
    // dumps the component object to a dir for testing
    // fs.writeFile('file.json', JSON.stringify(component.files, null, 2), (error) => {
    //   if (error) throw error;
    // });

  }
}

module.exports = DoxygenRunner
