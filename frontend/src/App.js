import React, { Component } from 'react'
import './App.css';
import PD from './PD/PD.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'
import 'react-bootstrap-typeahead/css/Typeahead.css';

//const restURL = 'http://0.0.0.0:8000/pipe_section.json'//
const restURL = 'http://localhost:5000/'
const proxyURL =  'http://localhost:3001'


export default class App extends Component {

  componentDidMount() {
    
  }


  render = () => (

    <PD restURL={restURL} proxyURL={proxyURL}/>

  )

}
