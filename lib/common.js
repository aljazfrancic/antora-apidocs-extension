/**
 * Strict Mode
 */
'use strict'

const { name: packageName } = require("../package.json");
const FileHandler = require("./filehandler");
const getLogger = require('@antora/logger');

class ApiRunnerCommon{
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

  createNavObject(page) {
    return {
      content: this.runnerConfig.apiDocsLinkText, url: page.pub.url, urlType: 'internal', order: 0,
    };
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

module.exports = (ApiRunnerCommon);
