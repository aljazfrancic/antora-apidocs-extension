/**
 * Strict Mode
 */
"use strict";

const FileHandler = require('./filehandler');

// 'docs/modules/ROOT/attachments/cdocs'
class DoxygenRunner {
  
  constructor () {
  
  }
  
  copyNeededFiles(config, component) {
    
    var fh = new FileHandler();

    var workingDir = fh.generateTempWorkingDir(config.workingPath);
    fh.copyFilesToDir(workingDir, component);

    return workingDir;
  }
}


module.exports = DoxygenRunner
