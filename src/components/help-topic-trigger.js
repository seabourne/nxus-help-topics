'use strict'

/* globals Beacon: false */

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
      this.addEventListener('click', this._boundClickListener)
      this._initialized = true
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._initialized) {
      this.removeEventListener('click', this._boundClickListener)
      this._initialized = false
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
    if (this.topic)
      Beacon('article', this.topic)
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
        display: inline;
        cursor: pointer;
        font: var(--help-topic-trigger-font);
        color: var(help-topic-trigger-color);
      }
      :host(.open) {
        color: var(--help-topic-trigger-color-open);
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
