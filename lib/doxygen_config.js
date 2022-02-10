/**
 * Strict Mode
 */
'use strict';

const { BaseGeneratorConfig } = require("./common");
const fs = require("fs");

class DoxygenConfig extends BaseGeneratorConfig {
  _doxygenPath

  constructor(playbook_config, component_config) {
    super();

    var confObj = DoxygenConfig.#getDoxygenConfigureObject(playbook_config);
    if (confObj) {
      this.#setDoxygenValues(confObj);
    }

    confObj = DoxygenConfig.#getDoxygenConfigureObject(component_config);
    if (confObj) {
      this.#setDoxygenValues(confObj);
    }
  }

  get doxygenPath() {
    return this._doxygenPath;
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
      this.logger.info('Doxygen extension disabled ');
      return this._enabled;
    }

    if (!fs.existsSync(this._doxygenPath)) {
      this.logger.error('Doxygen executable not found at ' + this._doxygenPath);
      this._enabled = false;
    }

    if (!fs.existsSync(this._workingPath)) {
      this.logger.error('Doxygen working path not found at ' + this._workingPath);
      this._enabled = false;
    }

    this.specialtyFiles.forEach((file) => {
      if (file.isCommonCapable) {
        if (!fs.existsSync(file.commonFilePath)) {
          this.logger.error('Overridable file not found at ' + file.commonFilePath);
          this._enabled = false;
        }
      }
    });

    return this._enabled;
  }

  static #getDoxygenConfigureObject(content) {
    var docGen;

    if ('extensions' in content) {
      docGen = content.extensions;
    } else {
      docGen = content;
    }

    if ('apiDocsGenerator' in docGen) {
      if ('doxygen' in docGen.apiDocsGenerator) {
        return docGen.apiDocsGenerator.doxygen;
      }
    }
  }

  #setDoxygenValues(content) {
    this.loadBaseGeneratorSettings(content);

    if ('doxygenPath' in content) {
      this._doxygenPath = content.doxygenPath;
    }

    return false;
  }
}

module.exports = DoxygenConfig;
