'use strict'

import {URL} from 'url'

import {pick} from 'lodash'
import fetch from 'node-fetch'

import {application, NxusModule} from 'nxus-core'
import {templater} from 'nxus-templater'

function mergeURL(str, options) {
  let url = new URL(str)
  url.username = options.apiKey
  url.password = 'x'
  return url
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
        helpTopicIndex: this.getHelpTopicIndex({status: 'published'}),
        getHelpTopicId: slug => (this._helpTopics[slug] && this._helpTopics[slug].id)
      }
    })

    application.once('startup', async () => {
      await this._initializeHelpTopics()
    })
  }

  _defaultConfig() {
    return {
      listURL: "https://docsapi.helpscout.net/v1/collections/:id/articles?pageSize=100",
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
   * @param {Object} options - index options:
   * *   `status` - selects help topics with specific status
   *     (`published`, `notpublished` or `all`); default is `published`
   * @return {Object} associative array of help topic specifications,
   *   indexed by Help Topic article slug.
   */
  getHelpTopicIndex(options = {}) {
    let status = options.status || 'published',
        index = {}
    for (let slug in this._helpTopics) {
      let topic = this._helpTopics[slug]
      if ((status != 'all') && (topic.status !== status)) continue
      index[slug] = pick(topic, ['id', 'slug', 'name'])
    }
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
    let topic = this._helpTopics[slug],
        id = topic && topic.id,
        detail
    if (id) {
      let url = mergeURL(this.config.getURL, this.config)
      url.pathname = url.pathname.replace(/\/:id/, `/${id}`)
      try {
        let response = await fetch(url),
            body = await response.json()
        detail = body.article
      }
      catch (e) {
        this.log.error('getHelpTopicDetail', e)
      }
      return detail
    }
  }

  async _initializeHelpTopics() {
    let url = mergeURL(this.config.listURL, this.config)
    url.pathname = url.pathname.replace(/\/:id/, `/${this.config.collectionId}`)
    try {
      for (let page = 1; ; page += 1) {
        url.searchParams.set('page', page.toString())
        let response = await fetch(url),
            body = await response.json(),
            items = body.articles && body.articles.items,
            pages = (body.articles && body.articles.pages) || 0
        if (items) {
          for (let topic of items)
            this._helpTopics[topic.slug] = topic
        }
        if (page >= pages) break
      }
    }
    catch (e) {
      this.log.error('_initializeHelpTopics', e)
    }
  }

}

const helpTopics = HelpTopics.getProxy()
export {HelpTopics as default, helpTopics}
