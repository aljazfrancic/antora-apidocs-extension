/**
 * Strict Mode
 */
"use strict";
const fs = require("fs");
const getLogger = require('@antora/logger')

/**
 * Class that is the container for the plugins configuration system.
 *
 * This configuration object was created to give the system a safe way to look
 * for configuration settings.  These classes are designed to add more generators
 * when needed.
 */
class ApiDocGeneratorConfig {
  doxygen;
  
  constructor(playbook_config, component_config) {
    this.doxygen = new DoxygenConfig(playbook_config, component_config)
  }
}

class DoxygenConfig {
  _doxygenPath;
  _workingPath;
  _enabled = false;
  specialtyFiles = [];
  
  constructor(playbook_config, component_config) {
    this.logger = getLogger('doxygen-extension')
    
    var confObj = this.#getDoxygenConfigureObject(playbook_config)
    if (confObj) {
      this.#setDoxygenValues(confObj)
    }
    
    confObj = this.#getDoxygenConfigureObject(component_config)
    if (confObj) {
      this.#setDoxygenValues(confObj)
    }
  }
  
  get doxygenPath() {
    return this._doxygenPath;
  }
  
  get workingPath() {
    return this._workingPath;
  }
  
  /**
   * This property does more than simply return a hidden value.  It checks the
   * various parts of the doxygen configuration and confirms them.  It will
   * return false if the executable doesn't exist or some other file its expecting
   * to exist.
   * @returns {boolean}
   */
  get enabled() {
    if (!fs.existsSync(this._doxygenPath)) {
      this.logger.error("Doxygen executable not found at " + this._doxygenPath)
      this._enabled = false;
    }
    
    if (!fs.existsSync(this._workingPath)) {
      this.logger.error("Doxygen working path not found at " + this._workingPath)
      this._enabled = false;
    }
    
    this.specialtyFiles.forEach(file => {
      if (file.isOverridable) {
        if (!fs.existsSync(file.overridableFilePath)) {
          this.logger.error("Overridable file not found at " + file.overridableFilePath)
          this._enabled = false;
        }
      }
    })
    
    return this._enabled;
  }
  
  #getDoxygenConfigureObject(content) {
    if ('extensions' in content) {
      if ('apiDocsGenerator' in content.extensions) {
        if ('doxygen' in content.extensions.apiDocsGenerator) {
          return content.extensions.apiDocsGenerator.doxygen;
        }
      }
    } else if ('apiDocsGenerator' in content) {
      if ('doxygen' in content.apiDocsGenerator) {
        return content.apiDocsGenerator.doxygen
      }
    }
  }
  
  #setDoxygenValues(content) {
    if ('enabled' in content) {
      this._enabled = content.enabled
    }
    
    if ('doxygenPath' in content) {
      this._doxygenPath = content.doxygenPath
    }
    
    if ('workingPath' in content) {
      this._workingPath = content.workingPath
    }
    
    if ('specialtyFiles' in content) {
      this.specialtyFiles = this.#loadSpecialtyFiles(content.specialtyFiles)
    }
    
    return false;
  }
  
  #loadSpecialtyFiles(content) {
    var files = [];
    
    if (content) {
      content.forEach(file => {
        files.push(new SpecialtyFile(file));
      })
    }
    
    return files;
  }
}

class SpecialtyFile {
  fileName;
  isRequired;
  isOverridable;
  overridableFilePath;
  
  constructor(content) {
    this.fileName = content.fileName;
    this.isRequired = content.isRequired;
    this.isOverridable = content.isOverridable;
    this.overridableFilePath = content.overridableFilePath;
  }
}

module.exports = ApiDocGeneratorConfig
