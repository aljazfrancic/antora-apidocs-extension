/* eslint-env mocha */
'use strict'

const { expect } = require('./harness')
const { promises: fsp } = require('fs')
const fs = require('fs')
const cheerio = require('cheerio')
const ospath = require('path')

const FIXTURES_DIR = ospath.join(__dirname, 'fixtures')
const WORK_DIR = ospath.join(__dirname, 'work')

const generateSite = require('@antora/site-generator')

describe('generateSite()', () => {
  const cacheDir = ospath.join(WORK_DIR, '.cache/antora')
  const outputDir = ospath.join(WORK_DIR, 'public')
  let playbookFile = ospath.join(FIXTURES_DIR, 'docs-site/antora-playbook.yml')

  beforeEach(() => fsp.rm(outputDir, { recursive: true, force: true }))
  after(() => fsp.rm(WORK_DIR, { recursive: true, force: true }))

  // it('should generate a site with a search index', async () => {
  //   const env = {}
  //   await generateSite(['--playbook', playbookFile, '--to-dir', outputDir, '--cache-dir', cacheDir, '--quiet'], env)
  //   expect(env).to.not.have.property('SITE_SEARCH_PROVIDER')
  //   const searchIndexPath = ospath.join(outputDir, 'search-index.js')
  //   expect(searchIndexPath).to.be.a.file()
  //   global.lunr = {}
  //   global.initSearch = function (lunr, index) {
  //     expect(Object.keys(index.store).length).to.equal(2)
  //     expect(index.store['/antora-lunr/index.html']).to.include({
  //       title: 'Antora x Lunr',
  //       url: '/antora-lunr/index.html',
  //     })
  //     expect(index.store['/antora-lunr/named-module/the-page.html']).to.include({
  //       title: 'The Page',
  //       url: '/antora-lunr/named-module/the-page.html',
  //     })
  //   }
  //   require(searchIndexPath)
  //   delete global.lunr
  //   delete global.initSearch
  // })
})
