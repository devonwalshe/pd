import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            pipe: props.pipe

        }

    }


    componentDidMount() {

    
    }

    drawPipe = () => {

        return [<div>test</div>]

    }

    render() {

        return (

            <div>
                {this.drawPipe(this.props.pipe)}
            </div>
            
        )
    }

}


PipeSection.propTypes = {

    pipe: PropTypes.array.isRequired

}
