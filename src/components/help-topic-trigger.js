'use strict'

/* globals Beacon: false */
/* eslint new-cap: ["warn", { "capIsNewExceptions": ["Beacon"] }] */

import {LitElement, html, css} from 'lit-element'


/** Help topic (Help Scout Beacon) trigger.
 * A trigger element that responds to `click` events by opening and
 * closing the Help Scout Beacon. If the `topic` property is defined,
 * it opens the beacon with the article indicated by the topic;
 * otherwise, it opens the beacon with the default help context.
 */
class HelpTopicTrigger extends LitElement {

  constructor() {
    super()
    this._boundClickListener = ::this._clickListener
    this.topic = undefined
  }

  static get properties() {
    return {
      /** Opened/closed state.
       */
      opened: {
        type: Boolean
      },
      /** Help Topic key.
       */
      topic: {
        type: String
      }
    }
  }

  get opened() { return this == HelpTopicTrigger._openTrigger }
  set opened(val) {
    let oldVal = this == HelpTopicTrigger._openTrigger
    val = !!val
    if (oldVal != val) {
      if (oldVal) { // beacon is open, we're the trigger
        HelpTopicTrigger._openTrigger = undefined
      }
      if (val) {
        if (HelpTopicTrigger._openTrigger) HelpTopicTrigger._openTrigger.closeBeacon()
        HelpTopicTrigger._openTrigger = this
      }
      this.classList.toggle('open', val)
      this.requestUpdate('opened', oldVal)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (!HelpTopicTrigger._initialized) {
      HelpTopicTrigger._beacon = document.querySelector('#beacon-container .BeaconContainer')
      document.addEventListener('click', ::HelpTopicTrigger._contextClickListener, {capture: true})
      HelpTopicTrigger._initialized = true
    }
    if (!this._initialized) {
      this._configureTrigger()
      this._initialized = true
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._initialized) {
      if (this._enabled) this.removeEventListener('click', this._boundClickListener)
      this._initialized = false
    }
  }

  _configureTrigger() {
    // this is what we get for relying on a window property to configure
    // the trigger element – we may have to delay configuration until
    // the window finishes loading.
    if (document.readyState !== 'complete') {
      window.addEventListener('load', ::this._configureTrigger, {once: true})
      return
    }
    let enabled = true, info
    if (this.topic) {
      info = (window.helpTopicIndex || {})[this.topic]
      this._id = info && info.id
      enabled = !!info
    }
    this._enabled = enabled
    this.classList.toggle('enabled', enabled)
    if (enabled) {
      this.addEventListener('click', this._boundClickListener)
      if (info && info.name) {
        let title = this.getAttribute('title')
        if (!title) {
          title = `Help Topic - ${info.name}`
          this.setAttribute('title', title)
        }
      }
    }
  }

  _clickListener(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.opened) {
      this.openBeacon()
      this.opened = true
    }
  }

  openBeacon() {
    if (this._id)
      Beacon('article', this._id)
    else
      Beacon('open')
    Beacon('once', 'close', () => { this.opened = false })
  }

  closeBeacon() {
    if (HelpTopicTrigger._openTrigger === this) Beacon('close')
  }

  render() {
    return html`<slot><span>&#xf05a;</span></slot>`
  }

  static get styles() {
    return css`
      :host {
        --help-topic-trigger-font-family: 'FontAwesome';
        --help-topic-trigger-font-size: 75%;
        --help-topic-trigger-line-height: 1;
        --help-topic-trigger-font: var(--help-topic-trigger-font-size)/var(--help-topic-trigger-line-height) var(--help-topic-trigger-font-family);
        --help-topic-trigger-color: inherit;
        --help-topic-trigger-color-open: red;
        display: none;
        cursor: pointer;
        font: var(--help-topic-trigger-font);
        color: var(--help-topic-trigger-color);
      }
      :host(.open) {
        color: var(--help-topic-trigger-color-open);
      }
      :host(.enabled) {
        display: inline;
      }
    `
  }

  static _contextClickListener(e) {
    if (this._openTrigger && !e.composedPath().includes(this._beacon)) {
      this._openTrigger.closeBeacon()
      e.stopPropagation()
    }
  }

}

customElements.define('help-topic-trigger', HelpTopicTrigger)

export {HelpTopicTrigger as default}
