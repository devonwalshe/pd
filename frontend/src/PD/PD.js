import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'


export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            pipe_section_instance: 0,
            pipe_section: {}

        }

    }


    componentDidMount() {

        this.fetchRest('pipe_section', 5, this.popPipeSections)

    }


    fetchRest = (rest, instance, cbk) => {

        const url = this.props.proxyURL + '?' + encodeURIComponent(this.props.restURL) + rest + (instance ? '/' + instance : '')

        fetch(url)
            .then(res => res.json())
            .then((data) => cbk(data, instance))
            .catch(console.log)

    }

    popPipeSections = (pipe_section, instance) => {
console.log(instance, pipe_section)
        this.setState({pipe_section: pipe_section, pipe_section_instance: instance})

    }

    render() {

        return (

            <div className="pipeline_graph_container" id="pipeline_graph_container">
                <PipeSection pipe_section={this.state.pipe_section} id={this.state.pipe_section_instance}/>
            </div>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
