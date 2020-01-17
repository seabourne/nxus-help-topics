import React from 'react'
import ReactDOM from 'react-dom'

const HelpTopicContext = React.createContext({what: 'ever'})

class HelpTopic extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let key = this.context[this.props.topic]
    return key ? (<help-topic-trigger topic={key}></help-topic-trigger>) : null
  }
}
HelpTopic.contextType = HelpTopicContext

const roots = document.querySelectorAll('.help-topic')
if (roots.length) {
  roots.forEach((f) => {
    ReactDOM.render(<FuelGauge data={JSON.parse(f.getAttribute('data-data'))} />, f)
  })
}

export { HelpTopic as default, HelpTopicContext }
