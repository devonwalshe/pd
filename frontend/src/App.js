import React, { Component } from 'react'
import './App.css'
import Discovery from './assets/Discovery.js'
import RunMatch from './assets/RunMatch.js'
import Client from './assets/Client.js'
import RawFile from './assets/RawFile.js'
import FeatureMap from './assets/FeatureMap.js'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'
import { Route, Switch, withRouter } from 'react-router-dom'

class App extends Component {

  
  constructor(props) {

    super(props)

    this.startPage = 'runmatches'

    this.state = {

      current: ''

    }

  }

  
  componentDidMount = () => this.clickMenu(this.state.current)


  clickMenu = location => {

    let page

    if (location)

      page = location
    
    else {

      const href = window.location.href.split('/')      
      page = !isNaN(href.slice(-1)[0]) ? href.slice(-2)[0] + '/' + href.slice(-1)[0] : href.slice(-1)[0]

    }
    
    this.props.history.push(`/${page}`)

  }

  componentDidUpdate(prevProps) {

    if (this.props.location !== prevProps.location)

      this.onRouteChanged()

  }


  onRouteChanged() {

    const href = window.location.href.split('/')
    let page = !isNaN(href.slice(-1)[0]) ? href.slice(-2)[0] : href.slice(-1)[0]
    
    if (!~['client','rawfiles','runmatches','featuremap','runmatch'].indexOf(page.split('/')[0])) {

      page = this.startPage
      this.props.history.push(`/${page}`)

    }

    this.setState({current: page})

  }

  render = () => (
    <>
      <div id="toast" className="toaster">
          Server returned invalid response
          <div onClick={e => e.currentTarget.parentElement.style.display = "none"}>x</div>    
        </div>
        <div className="menu">
          <div>AKD Data Matching Tool
            <div id="spinner">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
          <div>
            <Button
              id="client"
              variant={this.state.current === "client" ? "outline-primary" : "link"}
              onClick={() => this.clickMenu("client")}
            >
              Pipeline
            </Button>
            <Button
              id="rawfiles"
              variant={this.state.current === "rawfiles" ? "outline-primary" : "link"}
              onClick={() => this.clickMenu("rawfiles")}
            >
              Raw Files
            </Button>
            <Button
              id="runmatches"
              variant={this.state.current === "runmatches" || this.state.current.split("/")[0] === "runmatch" ? "outline-primary" : "link"}
              onClick={() => this.clickMenu("runmatches")}
            >
              Run Matches
            </Button>
            <Button
              id="featuremap"
              variant={this.state.current === "featuremap" ? "outline-primary" : "link"}
              onClick={() => this.clickMenu("featuremap")}
            >
              Feature Map
            </Button>
          </div>
        </div>
      <main>
        <Switch>
            <Route path="/client" component={Client} />
            <Route path="/rawfiles" component={RawFile} />
            <Route path="/runmatches" component={RunMatch} />
            <Route path="/featuremap" component={FeatureMap} />
            <Route path="/runmatch" component={Discovery} />
        </Switch>
      </main>
    </>
  )

}


export default withRouter(App)