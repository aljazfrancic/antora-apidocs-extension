/**
 * Strict Mode
 */
"use strict";

const FileHandler = require('./filehandler');
const getLogger = require('@antora/logger')
// const fs = require("fs");
const {exec} = require('child_process');
const path = require("path");

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
  
  loadFiles(component, workingDir) {
    var promise = this.fh.readFilesFromWorktree(workingDir, "build");
    
    var actualResult;
    var actualErr;
    
    promise.then(function (result) {
      component.files.push(result)
      // component.files = component.files.concat(result);
      // addFilesToComponent(component, result)
      // actualResult = result; // "Stuff worked!"
    }, function (err) {
      actualErr = err; // Error: "It broke"
    });
  }
  

}

function addFilesToComponent(component, files){
  
  // component.files.push(files);
}
module.exports = DoxygenRunner
