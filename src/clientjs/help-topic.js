import React from 'react'
import ReactDOM from 'react-dom'

const HelpTopicContext = React.createContext({what: 'ever'})

class HelpTopic extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let info = this.context[this.props.topic]
    return info ? (<help-topic-trigger topic={info.id}>{this.props.children}</help-topic-trigger>) : null
  }
}
HelpTopic.contextType = HelpTopicContext

export { HelpTopic as default, HelpTopicContext }
