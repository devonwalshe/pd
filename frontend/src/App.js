import React, { Component } from 'react';
import './App.css';
import PD from './PD/PD.js'

const restURL = 'http://0.0.0.0:8000/pipe_section.json'//'http://localhost:5000/'
const proxyURL =  'http://localhost:3001'

export default class App extends Component {

  componentDidMount() {
    
  }


  render = () => (

    <PD restURL={restURL} proxyURL={proxyURL}/>

  )

}
