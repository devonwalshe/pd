import React, { Component } from 'react'
import './App.css';
import PD from './PD/PD.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap2-toggle.css'
import 'react-bootstrap-typeahead/css/Typeahead.css';

const restURL = 'http://localhost:5000/'
const proxyURL =  'http://localhost:3001'


export default class App extends Component {

  render = () => (

    <PD restURL={restURL} proxyURL={proxyURL}/>

  )

}
