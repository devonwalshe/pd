import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Form, Col, Row } from 'react-bootstrap';

export default class PipeSections extends Component {

    constructor(props) {

        super(props)

        this.state = {

            options: [],
            instance: 0

        }

    }

    _isLoaded = false

    componentDidUpdate(previousProps) {

        if (!this.props.instance !== previousProps.instance)

            this.setOptions()

    }


    setOptions = () => {

        let options = []

        const data = this.props.run_matches || {}

        for (let i = 0, ix = data.length; i < ix; i += 1)

            data[i].run_match === this.stateoptions.push(<option key={i} value={data[i].pipeline}>{data[i].id + ':' + data[i].run_a + '_' + data[i].run_a}</option>)

        this.setState({options: options})

    }

    render() {

        return (

            <Form.Control as="select">
                <option>Pipe Section...</option>
                {this.state.run_matches}
            </Form.Control>
        
        )
    }
    
}


RunMatches.propTypes = {

    run_matches: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired

}
