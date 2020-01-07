'use strict'

import {URL} from 'url'

import {pick} from 'lodash'
import request from 'request-promise-native'

import {application, NxusModule} from 'nxus-core'

function splitURL(str) {
  let url = new URL(str),
      params = {}
  url.searchParams.forEach((value, name) => { params[name] = value })
  return [url.origin + url.pathname, params]
}


/** Help Topics (interface to Help Scout).
 *
 * It accepts these configuration parameters:
 * *   `apiKey` - The HelpScout Docs API key used for authentication
 *     (see https://developer.helpscout.com/docs-api/).
 * *   `collectionId` - The id of the collection containing the help
 *     topic articles. It looks like the easiest place to find the
 *     collection id is in the URL for the Help Scout document library
 *     landing page (for example,
 *     `https://secure.helpscout.net/docs/5d8a195e2c7d3a7e9ae18b54/`).
 * *   `listURL` - the Docs API List Articles endpoint and parameters
 *     (default `https://docsapi.helpscout.net/v1/collections/:id/articles?status=published&pageSize=100`)
 * *   `getURL` - the Docs API Get Article endpoint and parameters
 *     (default `https://docsapi.helpscout.net/v1/articles/:id`)
 *
 * @private
 */
class HelpTopics extends NxusModule {
  constructor() {
    super()

    this._helpTopics = []
    this._helpTopicIndex = {}

    application.once('startup', async () => {
      await this._initializeHelpTopics()
    })
  }

  _defaultConfig() {
    return {
      listURL: "https://docsapi.helpscout.net/v1/collections/:id/articles?status=published&pageSize=100",
      getURL: "https://docsapi.helpscout.net/v1/articles/:id",
      collectionId: "",
      apiKey: "" }
  }

  /** Gets available help topics.
   *
   * The returned help topic specifications include these properties:
   * *   `id` - article identifier used by the Beacon
   * *   `slug` - article slug
   * *   `name` - article name
   *
   * @return {Array} array of help topic specifications
   */
  async getHelpTopics() {
    let topics = this._helpTopics.map(topic => pick(topic, ['id', 'slug', 'name']) )
    return topics
  }

  /** Gets help topic details.
   *
   * @param {string} slug - article slug
   * @return {Object} help topic details
   */
  async getHelpTopicDetail(slug) {
    let config = this.config,
        topic = this._helpTopicIndex[slug],
        id = topic && topic.id,
        detail
    if (id) {
      let [uri, params] = splitURL(config.getURL),
          options = {
            uri: uri.replace(/\/:id/, `/${id}`),
            params,
            auth: { username: config.apiKey, password: 'x' },
            json: true // Automatically parses the JSON string in the response
          }
      try {
        let response = await request(options)
        detail = response.article
      }
      catch (e) {
        this.log.error('getHelpTopicDetail', e)
      }
      return detail
    }
  }

  async _initializeHelpTopics() {
    let config = this.config,
        [uri, params] = splitURL(config.listURL),
        options = {
          uri: uri.replace(/\/:id/, `/${config.collectionId}`),
          params,
          auth: { username: config.apiKey, password: 'x' },
          json: true // Automatically parses the JSON string in the response
        }
    try {
      let response = await request(options),
          items = response.articles && response.articles.items
      if (items) {
        this._helpTopics = items
        for (let topic of this._helpTopics)
          this._helpTopicIndex[topic.slug] = topic
      }
    }
    catch (e) {
      this.log.error('_initializeHelpTopics', e)
    }
  }

}

const helpTopics = HelpTopics.getProxy()
export {HelpTopics as default, helpTopics}
