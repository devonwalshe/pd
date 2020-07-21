import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

export default class App extends Component {

  componentDidMount() {
    
    fetch('http://localhost:3001?' + encodeURIComponent('http://localhost:5000/run_matches/'))
    .then(res => res.json())
    .then((data) => {
     
      console.log(data)
    })
    .catch(console.log)
  }


  render = () => (

    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>

  )

}
