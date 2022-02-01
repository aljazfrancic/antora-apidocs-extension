/**
 * Strict Mode
 */
"use strict";
// var vfs = require('vinyl-fs');
const fs = require('fs')
const path = require('path');
const minimatch = require("minimatch")

class FileHandler {
  
  generateTempWorkingDir(basedir) {
    var guid = this.createUUID();
    var tmpDir = path.join(basedir, guid);
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, {recursive: true});
    }
    
    return tmpDir;
  }
  
  copyFilesToDir(tmpDir, component) {
    component.files.forEach(file => {
      if (minimatch(file.path, "code_src/**/*.*")) {
        
        console.log(file.path)
      }
      // console.dir(file.src, {depth: 0});
    })
  }
  
  loadNewFilesintoComponent(tmpDir) {
    // vfs.src(['docs/code_src'])
    //   // .pipe(map(log))
    //   .pipe(vfs.dest(tmpDir));
  }
  
  createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = FileHandler
