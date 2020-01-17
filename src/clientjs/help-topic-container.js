import React from 'react'
import ReactDOM from 'react-dom'
import {HelpTopicContext} from './help-topic.js'

/** Help Topic Container.
 * Provides a React Context for `<HelpTopic>` components. The context
 * defines an object that maps help topic slugs to identifiers.
 *
 * Usage:
 *     ```
 *     <div class="help-topic-container" data-topics='<%-JSON.stringify(helpTopicIndex)%>'>
 *       ... content containing <HelpTopic> components
 *     </div>
 *     ```
 */
class HelpTopicContainer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <HelpTopicContext.Provider value={this.props.topics} >
        {this.props.children}
      </HelpTopicContext.Provider>
    )
  }
}

// THIS DOESN'T WORK
const roots = document.querySelectorAll('.help-topic-container')
if (roots.length) {
  roots.forEach((f) => {
    let children = Array.from(f.children)
    ReactDOM.hydrate(
      React.createElement(HelpTopicContainer,
        { topics: JSON.parse(f.getAttribute('data-topics')) }, children),
      f)
  })
}

export { HelpTopicContainer as default }
