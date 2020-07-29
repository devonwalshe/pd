import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Form, Col, Row } from 'react-bootstrap';

export default class RunMatches extends Component {

    constructor(props) {

        super(props)

        this.state = {

            options: []

        }

    }

    _isLoaded = false

    componentDidUpdate(previousProps) {

        if (!this.state.options.length)

            this.setOptions()

    }


    setOptions = () => {

        let options = []

        const data = this.props.run_matches || {}

        for (let i = 0, ix = data.length; i < ix; i += 1)

            options.push(<option key={i} value={data[i].pipeline}>{data[i].id + ':' + data[i].run_a + '_' + data[i].run_a}</option>)

            //run_matches.push({
                //key: data[i].id,
                //label: data[i].id + ':' + data[i].run_a + '_' + data[i].run_a,
               // value: data[i].pipeline
            //})


        this.setState({options: options})

    }

    render() {

        return (

            <Form.Control as="select" defaultValue="Choose...">
                <option>Run Matches...</option>
                {this.state.run_matches}
            </Form.Control>
        
        )
    }
    
}


RunMatches.propTypes = {

    run_matches: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired

}
