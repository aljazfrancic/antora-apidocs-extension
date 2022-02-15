/**
 * Strict Mode
 */
'use strict';

const { name: packageName } = require("../package.json");
const FileHandler = require("./filehandler");
const getLogger = require('@antora/logger');

const logger = getLogger();

class ApiRunnerCommon {
  constructor(baseConfig) {
    this.runnerConfig = baseConfig;

    this.logger = getLogger(packageName);
    this.fh = new FileHandler(baseConfig);
  }

  copyNeededFiles(component) {
    const workingDir = this.fh.generateTempWorkingDir(this.runnerConfig);
    this.fh.copyFilesToDir(workingDir, component);
    this.fh.processSpecialtyFiles(workingDir, component);

    return workingDir;
  }

  async loadFiles(component, workingDir) {
    const files = await this.fh.readFilesFromWorktree(workingDir, this.runnerConfig.outputFilesBuildDir);
    component.files = component.files.concat(files);
  }

  filterContentCatForIndex(contentCatalog, component, version) {
    return contentCatalog
      .findBy({ component, version, family: 'attachment' })
      .filter((page) => page.out)
      .filter((page) => {
        if (page.src.path.endsWith(this.runnerConfig.attachmentDir + '/' + this.runnerConfig.indexFilename)) {
          return page;
        }
      });
  }
}

class BaseGeneratorConfig {
  _workingPath = '/tmp';
  _codeDirectory = 'code_src';
  _enabled = false;
  _outputFilesDestination = 'modules/ROOT/attachments';
  _outputFilesBuildDir = 'build';
  _attachmentDir = "cdoc";
  _indexFilename = "index.html";
  _apiDocsLinkText = "API Documentation";
  specialtyFiles = [];

  constructor() {
    this.logger = getLogger(packageName);
  }

  get workingPath() {
    return this._workingPath;
  }

  get attachmentDir() {
    return this._attachmentDir;
  }

  get indexFilename() {
    return this._indexFilename;
  }

  get codeDirectory() {
    return this._codeDirectory;
  }

  get apiDocsLinkText() {
    return this._apiDocsLinkText;
  }

  get outputFilesDestination() {
    return this._outputFilesDestination;
  }

  get outputFilesBuildDir() {
    return this._outputFilesBuildDir;
  }

  loadSpecialtyFiles(content) {
    var files = [];

    if (content) {
      for (const file of content) {
        files.push(new SpecialtyFile(file));
      }
    }

    return files;
  }

  loadBaseGeneratorSettings(content) {
    if ('enabled' in content) {
      this._enabled = content.enabled;
    }

    if ('codeDirectory' in content) {
      this._codeDirectory = content.codeDirectory;
    }

    if ('workingPath' in content) {
      this._workingPath = content.workingPath;
    }

    if ('specialtyFiles' in content) {
      this.specialtyFiles = this.loadSpecialtyFiles(content.specialtyFiles);
    }

    if ('resultFilesDestination' in content) {
      this._outputFilesDestination = content.resultFilesDestination;
    }
    if ('attachmentDir' in content) {
      this._attachmentDir = content.attachmentDir;
    }
    if ('indexFilename' in content) {
      this._indexFilename = content.indexFilename;
    }
    if ('apiDocsLinkText' in content) {
      this._apiDocsLinkText = content.apiDocsLinkText;
    }
  }
}

class SpecialtyFile {
  fileName;
  isRequired;
  isCommonCapable;
  commonFilePath;

  constructor(content) {
    this.fileName = content.fileName;
    this.isRequired = content.isRequired;
    this.isCommonCapable = content.isCommonCapable;
    this.commonFilePath = content.commonFilePath;
  }
}

function createNavObject(page, urlText) {
  logger.info("Creating nav link for " + page.pub.url);
  return {
    content: urlText,
    url: page.pub.url,
    urlType: 'internal',
    order: 0,
  };
}

/**
 * Returns the common key used in keeping track of component/version combinations.
 * @param component the ComponentVersionData object that must have a name and version property.
 * @returns {string}
 */
function genVersionNameKey(component) {
  return component.version + '@' + component.name;
}

/**
 * Takes in an array of pages and creates URL's in the navigation.
 * @param pagesList The list of pages to add to the Nav.
 * @param componentVersion The component version data bucket for the component/version.
 * @param navigationCatalog The injected navigation catalog.
 * @param urlText The text of the URL.
 * @param addToBottom If set true, will add the nav items to the bottom of the nav instead of the top.
 */
function addUrlToTopOfNav(pagesList, componentVersion, navigationCatalog, urlText, addToBottom = false) {
  for (const page of pagesList) {
    // Check that a Nav exists already
    if (componentVersion.navigation === undefined) {
      componentVersion.navigation = navigationCatalog.addNavigation(componentVersion.name, componentVersion.version, [createNavObject(page, urlText)]);
      // bucket.navigation.push(this.createNavObject(page));
    } else if (componentVersion.navigation.length === 0) {
      componentVersion.navigation.push(createNavObject(page, urlText));
    } else {
      // Add the API Docs index to the page navigation
      if (addToBottom) {
        componentVersion.navigation.push(createNavObject(page, urlText));
      } else {
        componentVersion.navigation[0].items.unshift(createNavObject(page, urlText));
      }
    }
  }
}

module.exports = { ApiRunnerCommon, BaseGeneratorConfig };
module.exports.genVersionNameKey = genVersionNameKey;
module.exports.addUrlToTopOfNav = addUrlToTopOfNav;
