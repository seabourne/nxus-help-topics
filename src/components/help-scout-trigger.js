'use strict'

/* globals Beacon: false */

import {LitElement, html, css} from 'lit-element'


/** Help Scout Beacon trigger.
 * A trigger element that responds to `click` events by opening and
 * closing the Help Scout Beacon. If the `topic` property is defined,
 * it opens the beacon with the article indicated by the topic;
 * otherwise, it opens the beacon with the default help context.
 */
class HelpScoutTrigger extends LitElement {

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

  get opened() { return this == HelpScoutTrigger._openTrigger }
  set opened(val) {
    let oldVal = this == HelpScoutTrigger._openTrigger
    val = !!val
    if (oldVal != val) {
      if (oldVal) { // beacon is open, we're the trigger
        HelpScoutTrigger._openTrigger = undefined
      }
      if (val) {
        if (HelpScoutTrigger._openTrigger) HelpScoutTrigger._openTrigger.closeBeacon()
        HelpScoutTrigger._openTrigger = this
      }
      this.classList.toggle('open', val)
      this.requestUpdate('opened', oldVal)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (!HelpScoutTrigger._initialized) {
      HelpScoutTrigger._beacon = document.querySelector('#beacon-container .BeaconContainer')
      document.addEventListener('click', ::HelpScoutTrigger._contextClickListener, {capture: true})
      HelpScoutTrigger._initialized = true
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
    if (HelpScoutTrigger._openTrigger === this) Beacon('close')
  }

  render() {
    return html`<slot></slot>`
  }

  static get styles() {
    return css`
      :host {
        display: inline;
        cursor: pointer;
      }
      :host(.open) {
        color: red;
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

customElements.define('help-scout-trigger', HelpScoutTrigger)

export {HelpScoutTrigger as default}
