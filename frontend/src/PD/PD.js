import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            pipe: []

        }

    }


    componentDidMount() {
        
        console.log(this.props)
        const url = this.props.proxyURL + '?' + encodeURIComponent(this.props.restURL)
        console.log(url)
        fetch(url)
            .then(res => res.json())
            .then((data) => {
            
                this.getPipeSection(data)
            console.log(data)
            })
            .catch(console.log)

    }

    getPipeSection = pipe => {

        let out = []

        for (let i = 0, ix = pipe.features.length; i < ix; i += 1) {

            for (let j = 0, jx = pipe.features[i].attributes.length; j < jx; j += 1) {

                out.push(j)

            }

        }

        this.setState({pipe: [0]})
    }

    render() {

        return (

            <PipeSection pipe={this.state.pipe}/>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
