import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Form, Col, Row } from 'react-bootstrap';
import Popup from "reactjs-popup";

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            pipe_section_raw: {},
            pipe_section: [],
            pipe_sections: [],
            pipe_section_instance: 0,
            run_matches: [],
            run_match_instance: 0

        }

    }


    componentDidMount() {

        this.fetchRest('run_matches', null, (data) => {

            this.setRunMatches(data, null, this.setRunMatches)

        })
        

    }


    fetchRest = (rest, instance, cbk) => {

        const url = this.props.proxyURL + '?' + encodeURIComponent(this.props.restURL) + rest + (instance ? '/' + instance : '')

        fetch(url)
            .then(res => res.json())
            .then((data) => {
                cbk(data, instance)
            })
            .catch(console.log)

    }


    selectRunMatch = e => {

        const i = e.currentTarget.options[e.currentTarget.selectedIndex].value

        this.setState({run_match_instance: e.currentTarget.options[e.currentTarget.selectedIndex].value}, () => this.fetchRest('pipe_sections', null, this.setPipeSections))

    }

    
    setRunMatches = data => {

        let options = []

        for (let i = 0, ix = data.length; i < ix; i += 1)
        
            options.push(<option key={i} value={data[i].pipeline}>{data[i].id + ':' + data[i].run_a + '_' + data[i].run_a}</option>)

        this.setState({run_matches: options})

    }

    selectPipeSection = e => {

        const i = Number(e.currentTarget.options[e.currentTarget.selectedIndex].value)
        
        this.fetchRest('pipe_section', i, data => this.displayPipeSection(data))
        

    }

    setPipeSections = data => {

        const run_match = Number(this.state.run_match_instance)
        
        let options = []

        for (let i = 0, ix = data.length; i < ix; i += 1)

            if (run_match === data[i].run_match)
            
                options.push(<option key={i} value={data[i].id}>{data[i].section_id}</option>)

        this.setState({pipe_sections: options})

    }

    displayPipeSection = data => {

        let features = [],
            width = 800,
            w = 0,
            out = []

        const pipe = data.features

        for (let i = 0, ix = pipe.length; i < ix; i += 1) {

            let feature = {

                    attributes: {},
                    id: pipe[i].id

                }

            for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {

                const { attribute_data, attribute_name } = pipe[i].attributes[j]

                feature.attributes[attribute_name] = attribute_data

                if (attribute_name === 'us_weld_dist_wc_ft')

                    feature.left = w += Number(attribute_data)

            }
            
            feature.attributes.feature_category && out.push(feature)

        }

        for (let i = 0, ix = out.length; i < ix; i +=1)

            features.push(<Popup
                key={out[i].id + 'popup'}
                trigger={
                    <div
                        className={"shape " + (out[i].attributes.feature_category === 'nan' ? 'valve' : out[i].attributes.feature_category)}
                        key={out[i].id}
                        style={{
                            left: width / w * out[i].left + 'px'
                        }}>
                    </div>
                }
                keepTooltipInside="#pipeline_graph_container"
                on="hover"
            >
                <div className="card">
                    <div className="content">
                        {(data => {
                            let out = []
                            for (let attr in data) {
                                out.push (<b key={attr + 'b'}>{attr}</b>)
                                out.push (<span key={attr + 'c'}>:</span>)
                                out.push (<span key={attr + 'd'}>{data[attr]}</span>)
                                out.push (<br key={attr + 'e'} />)
                            }
                            return out
                        })(out[i].attributes)}
                    </div>
                </div>                
            </Popup>)

        this.setState({pipe_section: features})

    }


    render() {

        return (

            <div>
                <Form>
                    <Row>
                        <Col>
                        <Form.Control as="select" onChange={this.selectRunMatch}>
                            <option>Run Matches...</option>
                            {this.state.run_matches}
                        </Form.Control>
                        </Col>
                        <Col>
                            <Form.Control as="select" onChange={this.selectPipeSection}>
                                <option>Pipe Section...</option>
                                {this.state.pipe_sections}
                            </Form.Control>
                        </Col>
                    </Row>
                </Form>
                <div className="pipeline_graph_container" id="pipeline_graph_container">
                    <div id="pipe_graph" style={{width: '100%'}}>
                        {this.state.pipe_section}
                    </div>
                </div>
            </div>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
