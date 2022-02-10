/**
 * Strict Mode
 */
'use strict';
const DoxygenConfig = require('./doxygen_config');

/**
 * Class that is the container for the plugin configuration system.
 *
 * This configuration object was created to give the system a safe way to look
 * for configuration settings.  These classes are designed to add more generators
 * when needed.
 */
class ApiDocGeneratorConfig {
  doxygen;

  constructor(playbook_config, component_config) {
    this.doxygen = new DoxygenConfig(playbook_config, component_config);
  }
}

module.exports = ApiDocGeneratorConfig;
