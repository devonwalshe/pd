import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            id: 0,
            pipe_section: {}

        }

    }


    componentDidMount() {
            
        const url = this.props.proxyURL + '?' + encodeURIComponent(this.props.restURL)
    
        fetch(url)
            .then(res => res.json())
            .then((data) => this.setState({pipe_section: data, id: 5}))
            .catch(console.log)

    }

    render() {

        return (

            <div className="pipeline_graph_container" id="pipeline_graph_container">
                <PipeSection pipe_section={this.state.pipe_section} id={this.state.id}/>
            </div>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
