/**
 * Strict Mode
 */
'use strict'
const fs = require('fs')
const getLogger = require('@antora/logger')
const { name: packageName } = require('../package.json')

/**
 * Class that is the container for the plugins configuration system.
 *
 * This configuration object was created to give the system a safe way to look
 * for configuration settings.  These classes are designed to add more generators
 * when needed.
 */
class ApiDocGeneratorConfig {
  doxygen

  constructor(playbook_config, component_config) {
    this.doxygen = new DoxygenConfig(playbook_config, component_config)
  }
}

class BaseGeneratorConfig {
  _workingPath
  _codeDirectory = 'code_src'
  _enabled = false
  _resultFilesDestination = 'modules/ROOT/attachments'
  specialtyFiles = []

  constructor() {
    this.logger = getLogger(packageName)
  }

  get workingPath() {
    return this._workingPath
  }

  get codeDirectory() {
    return this._codeDirectory
  }
  
  get resultFilesDestination() {
    return this._resultFilesDestination
  }
  
  loadSpecialtyFiles(content) {
    var files = []

    if (content) {
      for (const file of content) {
        files.push(new SpecialtyFile(file))
      }
    }

    return files
  }

  loadBaseGeneratorSettings(content) {
    if ('enabled' in content) {
      this._enabled = content.enabled
    }

    if ('codeDirectory' in content) {
      this._codeDirectory = content.codeDirectory
    }

    if ('workingPath' in content) {
      this._workingPath = content.workingPath
    }

    if ('specialtyFiles' in content) {
      this.specialtyFiles = this.loadSpecialtyFiles(content.specialtyFiles)
    }
    
    if ('resultFilesDestination' in content) {
      this._resultFilesDestination = content.resultFilesDestination
    }
    
  }
}

class DoxygenConfig extends BaseGeneratorConfig {
  _doxygenPath

  constructor(playbook_config, component_config) {
    super()

    var confObj = DoxygenConfig.#getDoxygenConfigureObject(playbook_config)
    if (confObj) {
      this.#setDoxygenValues(confObj)
    }

    confObj = DoxygenConfig.#getDoxygenConfigureObject(component_config)
    if (confObj) {
      this.#setDoxygenValues(confObj)
    }
  }

  get doxygenPath() {
    return this._doxygenPath
  }

  /**
   * This property does more than simply return a hidden value.  It checks the
   * various parts of the doxygen configuration and confirms them.  It will
   * return false if the executable doesn't exist or some other file its expecting
   * to exist.
   * @returns {boolean}
   */
  get enabled() {
    if (!this._enabled) {
      this.logger.info('Doxygen extension disabled ')
      return this._enabled
    }

    if (!fs.existsSync(this._doxygenPath)) {
      this.logger.error('Doxygen executable not found at ' + this._doxygenPath)
      this._enabled = false
    }

    if (!fs.existsSync(this._workingPath)) {
      this.logger.error('Doxygen working path not found at ' + this._workingPath)
      this._enabled = false
    }

    this.specialtyFiles.forEach((file) => {
      if (file.isCommonCapable) {
        if (!fs.existsSync(file.commonFilePath)) {
          this.logger.error('Overridable file not found at ' + file.commonFilePath)
          this._enabled = false
        }
      }
    })

    return this._enabled
  }

  static #getDoxygenConfigureObject(content) {
    var docGen

    if ('extensions' in content) {
      docGen = content.extensions
    } else {
      docGen = content
    }

    if ('apiDocsGenerator' in docGen) {
      if ('doxygen' in docGen.apiDocsGenerator) {
        return docGen.apiDocsGenerator.doxygen
      }
    }
  }

  #setDoxygenValues(content) {
    this.loadBaseGeneratorSettings(content)

    if ('doxygenPath' in content) {
      this._doxygenPath = content.doxygenPath
    }

    return false
  }
}

class SpecialtyFile {
  fileName
  isRequired
  isCommonCapable
  commonFilePath

  constructor(content) {
    this.fileName = content.fileName
    this.isRequired = content.isRequired
    this.isCommonCapable = content.isCommonCapable
    this.commonFilePath = content.commonFilePath
  }
}

module.exports = ApiDocGeneratorConfig
