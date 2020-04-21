/**
 * @jest-environment node
 */

/* globals jest: false, beforeAll: false, beforeEach: false, describe: false, it: false, expect: false */

'use strict'

import {URL} from 'url'
import util from 'util'

import {omit} from 'lodash'
import URLPattern from 'url-pattern'

import {application} from 'nxus-core'

import HelpTopics, {helpTopics} from '../index.js'

import helpScoutArticles from './data/helpScoutArticles.js'


const helpScoutHost = 'docsapi.helpscout.net'
const collectionsURLPattern = new URLPattern('/v1/collections/:id/articles')
const articlesURLPattern = new URLPattern('/v1/articles/:id')
const detailProperties = ['text', 'categories', 'related', 'keywords']

const fetchMock = async (str) => {
  let url = new URL(str.toString()), body, match
  if ((url.protocol != 'http:') && (url.protocol != 'https:'))
    throw new Error(`Error: Invalid protocol: ${url.protocol}`)
  if (url.host != helpScoutHost)
    throw new Error(`Error: getaddrinfo ENOTFOUND ${url.host}`)
  match = collectionsURLPattern.match(url.pathname)
  if (match) {
    let items = Object.values(helpScoutArticles).map(article => omit(article, detailProperties)),
        pageSize = parseInt(url.searchParams.get('pageSize') || '50'),
        page = parseInt(url.searchParams.get('page') || '1'),
        pages = Math.ceil(items.length / pageSize),
        offset = (page - 1) * pageSize
    items = items.slice(offset, offset + pageSize)
    body = {articles: {page, pages, count: items.length, items}}
  }
  else {
    match = articlesURLPattern.match(url.pathname)
    if (match) {
      let article = helpScoutArticles[match.id]
      if (article)
        body = {article}
      else
        body = {code: 404, error: 'Resource not found'}
    }
    else {
      let code = 404,
          err = {code: code, error: `The specified resource was not found: ${url.pathname}`},
          error = new Error(`${code} - ${util.format(err)}`)
      error.error = err
      error.statusCode = code
      throw error
    }
  }
  let response = {
        body,
        json: async function() { return this.body } }
  return response
}

jest.mock('node-fetch')
import fetch from 'node-fetch'


beforeAll(() => {
  fetch.mockImplementation(fetchMock)
  application.config.help_topics = {
    collectionId: "5d8a195e2c7d3a7e9ae18b54",
    apiKey: "97edea83c395d24a7546ae8ce52cc55b7b87ff94",
    listURL: "https://docsapi.helpscout.net/v1/collections/:id/articles?status=published&pageSize=2" }
      // pageSize 2 forces initialization code to do multiple fetches 
})

describe("HelpTopics", () => {
  let help, index

  describe("Load", () => {
    it("should not be null", () => {
      expect(HelpTopics).not.toBeNull()
      expect(helpTopics).not.toBeNull()
    })

    it("should be instantiated", () => {
      help = new HelpTopics();
      expect(help).not.toBeNull();
    });

    it("should have help topics after application 'init', 'load' and 'startup'", async () => {
      const desiredTopic = {
          id: expect.any(String),
          slug: expect.any(String),
          name: expect.any(String) }
      await application.emit('init')
      await application.emit('load')
      await application.emit('startup')
      index = await help.getHelpTopicIndex()
      expect(index).toBeInstanceOf(Object)
      expect(Object.keys(index).length).toEqual(Object.keys(helpScoutArticles).length)
      for (let slug in index) {
        let topic = index[slug]
        expect(topic).toMatchObject(desiredTopic)
        expect(topic.slug).toMatch(slug)
      }
    }, 60000)

    it("should have details for all help topics", async () => {
      const desiredDetail = {
          id: expect.any(String),
          slug: expect.any(String),
          name: expect.any(String),
          text: expect.any(String) }
      for (let slug in index) {
        let detail = await help.getHelpTopicDetail(slug)
        expect(detail).toMatchObject(desiredDetail)
        expect(detail.slug).toMatch(slug)
      }
    }, 60000)

  })

})
