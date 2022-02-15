/**
 * Strict Mode
 */
'use strict'
// var vfs = require('vinyl-fs');
const fs = require('fs')
const ospath = require('path')
const minimatch = require('minimatch')
const getLogger = require('@antora/logger')
const { pipeline, Writable } = require('stream')
const globStream = require('glob-stream')
const forEach = (write) => new Writable({ objectMode: true, write })
const { promises: fsp } = fs
const posixify = ospath.sep === '\\' ? (p) => p.replace(/\\/g, '/') : undefined
const File = require('./file')
const { name: packageName } = require('../package.json')
const { v4: uuidv4 } = require('uuid');


class FileHandler {
  constructor(config) {
    this.logger = getLogger(packageName)
    this.config = config
  }

  generateTempWorkingDir() {
    var tmpDir = ospath.join(this.config.workingPath, uuidv4())

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    this.logger.info('Created working directory ' + tmpDir)

    return tmpDir
  }

  copyFilesToDir(tmpDir, component) {
    this.loopSearchCopyComponentFiles(tmpDir, component, this.config.codeDirectory + '/**/*.*')
  }

  processSpecialtyFiles(tmpDir, component) {
    this.config.specialtyFiles.forEach((file) => {
      // console.dir(file);
      this.#copyInCommonFile(tmpDir, file)
      this.loopSearchCopyComponentFiles(tmpDir, component, file.fileName)
    })
  }

  async readFilesFromWorktree(worktreePath, startPath) {
    const cwd = ospath.join(worktreePath, startPath, '.') // . shaves off trailing slash

    return fsp.stat(cwd).then(
      (startPathStat) => {
        if (!startPathStat.isDirectory()) this.logger.error(`the start path '${startPath}' is not a directory`)
        return this.srcFs(cwd)
      },
      () => {
        this.logger.error(`the start path '${startPath}' does not exist`)
      }
    )
  }

  async srcFs(cwd) {
    var CONTENT_SRC_GLOB = cwd + '/**/*.*'
    var CONTENT_SRC_OPTS

    const relpathStart = cwd.length + 1
    return new Promise((resolve, reject, cache = Object.create(null), files = []) =>
      pipeline(
        globStream(CONTENT_SRC_GLOB, Object.assign({ cache, cwd }, CONTENT_SRC_OPTS)),
        forEach(({ path: abspathPosix }, _, done) => {
          // console.log(abspathPosix);
          if (Array.isArray(cache[abspathPosix])) return done() // detects some directories, but not all
          const abspath = posixify ? ospath.normalize(abspathPosix) : abspathPosix
          const relpath = abspath.substr(relpathStart)
          this.symlinkAwareStat(abspath).then(
            (stat) => {
              if (stat.isDirectory()) return done() // detects remaining directories
              fsp.readFile(abspath).then(
                (contents) => {
                  var newfile = new File({
                    path: posixify ? posixify(relpath) : relpath,
                    contents,
                    stat,
                    src: { abspath },
                  })
                  this.#prepareSrc(newfile)

                  files.push(newfile)
                  done()
                },
                (readErr) => {
                  done(Object.assign(readErr, { message: readErr.message.replace(`'${abspath}'`, relpath) }))
                }
              )
            },
            (statErr) => {
              if (statErr.symlink) {
                statErr.message =
                  statErr.code === 'ELOOP'
                    ? `Symbolic link cycle detected at ${relpath}`
                    : `Broken symbolic link detected at ${relpath}`
              } else {
                statErr.message = statErr.message.replace(`'${abspath}'`, relpath)
              }
              done(statErr)
            }
          )
        }),
        (err) => (err ? reject(err) : resolve(files))
      )
    )
  }

  #prepareSrc(newfile) {
    var oldHistory = ospath.join(this.config.outputFilesDestination, newfile.history[0])

    let { basename, extname, stem, path } = newfile.src

    newfile.history[0] = oldHistory
    path = oldHistory

    let update
    if (basename == null) {
      update = true
      basename = ospath.basename(newfile.path)
    }
    if (stem == null) {
      update = true
      if (extname == null) {
        if (~(extname = basename.lastIndexOf('.'))) {
          stem = basename.substr(0, extname)
          extname = basename.substr(extname)
        } else {
          stem = basename
          extname = ''
        }
      } else {
        stem = basename.substr(0, basename.length - extname.length)
      }
    } else if (extname == null) {
      update = true
      extname = basename.substr(stem.length)
    }
    return update ? Object.assign(newfile.src, { basename, extname, stem, path }) : src
  }

  symlinkAwareStat(path_) {
    return fsp.lstat(path_).then((lstat) => {
      if (!lstat.isSymbolicLink()) return lstat
      return fsp.stat(path_).catch((statErr) => {
        throw Object.assign(statErr, { symlink: true })
      })
    })
  }

  #copyInCommonFile(tmpDir, commonfile) {
    var newfile = ospath.join(tmpDir, commonfile.fileName)

    if (commonfile.isCommonCapable) {
      const data = fs.readFileSync(commonfile.commonFilePath, 'utf8')
      fs.writeFileSync(newfile, data)
      this.logger.warn('wrote file: ' + newfile)
    }
  }

  loopSearchCopyComponentFiles(tmpDir, componentVersionData, globPattern) {
    for (const file of componentVersionData.files) {
      if (minimatch(file.path, globPattern)) {
        // this is the location that the file will be copied to
        var newFile = ospath.join(tmpDir, file.path)
        var parentDir = ospath.dirname(newFile)

        fs.mkdirSync(parentDir, { recursive: true })

        // Just for safety, we are going to attempt to delete any file that already exists.
        try {
          if (fs.existsSync(newFile)) {
            fs.unlinkSync(newFile)
          }
        } catch (err) {
          this.logger.error(err)
        }

        // write the file out to the drive.
        fs.writeFileSync(newFile, file.contents.toString('utf-8'), { encoding: 'utf8', flag: 'w' })
      }
    }
  }
}

module.exports = FileHandler
