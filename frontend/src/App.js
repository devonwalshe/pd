import React, { Component } from 'react'
import './App.css'
import PD from './PD/PD.js'
import Dashboard from './PD/Dashboard.js'
import Pipelines from './PD/Pipelines.js'
import FeatureMap from './PD/FeatureMap.js'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'
import 'react-bootstrap-typeahead/css/Typeahead.css'

export default class App extends Component {

  constructor(props) {

    super(props)

    this.state = {
      current: 2,
      page: null
    }

    this.buttons = ['Dashboard', 'Pipelines', 'Run Matches', 'Feature Maps']

  }

  

  componentDidMount = () => {

    this.getPage()

  }

  clickMenu = id => {

    document.getElementById(this.buttons[this.state.current]).variant = 'link'
    document.getElementById(id).variant = 'outline-primary'

    this.setState({current: this.buttons.indexOf(id)}, this.getPage)

  }

  getPage = () => {

    let pages = [
      (<Dashboard/>),
      (<Pipelines/>),
      (<PD/>),
      (<FeatureMap/>)
    ]

    this.setState({page: pages[this.state.current]})


  }

  render = () => (

    <>
      <div id="toast" className="toaster">
        Server returned invalid response
        <div onClick={e => e.currentTarget.parentElement.style.display = 'none'}>x</div>    
      </div>
      <div className="menu">
        <div>AKD Data Matching Tool
          <div id="spinner">
            <i className="fa fa-spinner fa-spin" />
          </div>
        </div>
        <div>
          {this.buttons.map((b, i) => (
            <Button id={b} key={b} variant={this.state.current === i ? 'outline-primary' : 'link'} onClick={() => this.clickMenu(b)}>{b}</Button>
          ))}
        </div>
      </div>
      <hr></hr>
      {this.state.page}
    </>
  )

}
