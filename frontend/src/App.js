import React, { Component } from 'react'
import './App.css'
import PD from './PD/PD.js'
import RunMatch from './PD/RunMatch.js'
import Pipeline from './PD/Pipeline.js'
import RawFile from './PD/RawFile.js'
import FeatureMap from './PD/FeatureMap.js'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'

export default class App extends Component {

  constructor(props) {

    super(props)

    this.state = {
      current: 1,
      page: null
    }

    this.pages = [
      {
        name: 'Pipelines',
        comp: (<Pipeline/>)
      },
      {
        name: 'Raw Files',
        comp: (<RawFile/>)
      },
      { 
        name: 'Run Matches',
        comp: (
          <RunMatch
            goRun={run_match => this.setState({page: (<PD run_match={Number(run_match)}/>)})}
          />
        )
      },
      {
        name: 'Feature Maps',
        comp: (<FeatureMap/>)
      }
    ]

  }

  
  componentDidMount = () => this.getPage()

  clickMenu = i => {


    document.getElementById(this.pages[this.state.current].name).variant = 'link'
    document.getElementById(this.pages[i].name).variant = 'outline-primary'

    this.setState({current: i}, this.getPage)

  }

  getPage = () => this.setState({page: this.pages[this.state.current].comp})

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
          {this.pages.map((p, i) => (
            <Button id={p.name} key={p.name} variant={this.state.current === i ? 'outline-primary' : 'link'} onClick={() => this.clickMenu(i)}>{p.name}</Button>
          ))}
        </div>
      </div>
      {this.state.page}
    </>
  )

}
