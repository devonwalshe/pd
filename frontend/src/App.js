import React, { Component } from 'react'
import './App.css'
import Discovery from './PD/Discovery.js'
import RunMatch from './PD/RunMatch.js'
import Pipeline from './PD/Pipeline.js'
import RawFile from './PD/RawFile.js'
import FeatureMap from './PD/FeatureMap.js'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'
import { BrowserRouter, Link, Route, Switch, withRouter } from 'react-router-dom'

class App extends Component {

  
  constructor(props) {

    super(props)

    this.startPage = 'runmatches'

    this.state = {

      current: this.startPage

    }

  }

  
  componentDidMount = () => this.clickMenu(this.state.current)


  clickMenu = id => {

      this.props.history.push(`/${id}`)

  }

  componentDidUpdate(prevProps) {

    if (this.props.location !== prevProps.location)

      this.onRouteChanged()

  }


  onRouteChanged() {

    document.getElementById(this.state.current).variant = 'link'
    
    const href = window.location.href.split('/')
    const page = !isNaN(href.slice(-1)[0]) ? href.slice(-2)[0] : href.slice(-1)[0]
    let current = page === 'runmatch' ? 'runmatches' : page

    if (!~['pipeline','rawfiles','runmatches','featuremap','runmatch'].indexOf(current)) {

      current = this.startPage
      this.props.history.push(`/${current}`)

    }

    this.setState({current: current})
    document.getElementById(current).variant = 'outline-primary'

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
              id="pipeline"
              variant={this.state.current === "pipeline" ? "outline-primary" : "link"}
              onClick={() => this.clickMenu("pipeline")}
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
              variant={this.state.current === "runmatches" ? "outline-primary" : "link"}
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
            <Route path="/pipeline" component={Pipeline} />
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