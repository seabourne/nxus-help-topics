'use strict'

import {URL} from 'url'

import {pick} from 'lodash'
import request from 'request-promise-native'

import {application, NxusModule} from 'nxus-core'
import {templater} from 'nxus-templater'

function splitURL(str) {
  let url = new URL(str),
      params = {}
  url.searchParams.forEach((value, name) => { params[name] = value })
  return [url.origin + url.pathname, params]
}


/** Help Topics (interface to Help Scout).
 * See the introduction for a list of configuration parameters.
 */
class HelpTopics extends NxusModule {
  constructor() {
    super()

    this._helpTopics = {}

    templater.templateDir(__dirname+"/templates")

    templater.on('renderContext', (opts) => {
      return {
        beaconKey: this.config.beaconKey,
        helpTopicIndex: this.getHelpTopicIndex(),
        getHelpTopicId: slug => (this._helpTopics[slug] && this._helpTopics[slug].id)
      }
    })

    application.once('startup', async () => {
      await this._initializeHelpTopics()
    })
  }

  _defaultConfig() {
    return {
      listURL: "https://docsapi.helpscout.net/v1/collections/:id/articles?status=published&pageSize=100",
      getURL: "https://docsapi.helpscout.net/v1/articles/:id",
      collectionId: "",
      apiKey: "",
      beaconKey: "" }
  }

  /** Gets an index of available help topics.
   *
   * The returned help topic specifications include these properties:
   * *   `id` - article id
   * *   `slug` - article slug
   * *   `name` - article name
   *
   * @return {Object} associative array of help topic specifications,
   *   indexed by Help Topic article slug.
   */
  getHelpTopicIndex() {
    let index = {}
    for (let slug in this._helpTopics)
      index[slug] = pick(this._helpTopics[slug], ['id', 'slug', 'name'])
    return index
  }

  /** Gets help topic details.
   *
   * The returned help topic details object includes these properties:
   * *   `id` - article id
   * *   `slug` - article slug
   * *   `name` - article name
   * *   `text` - article text; may include HTML markup
   * (There are additional properties; see the Help Scout documentation
   * for the [Article Object](https://developer.helpscout.com/docs-api/objects/article/).
   *
   * @param {string} slug - article slug
   * @return {Object} help topic details
   */
  async getHelpTopicDetail(slug) {
    let config = this.config,
        topic = this._helpTopics[slug],
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
        for (let topic of items)
          this._helpTopics[topic.slug] = topic
      }
    }
    catch (e) {
      this.log.error('_initializeHelpTopics', e)
    }
  }

}

const helpTopics = HelpTopics.getProxy()
export {HelpTopics as default, helpTopics}
