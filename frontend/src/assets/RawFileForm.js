import React, { Component } from 'react'
import { Col, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'


export default class RawFileForm extends Component {

    constructor(props) {

        super(props)

        this.state = {
            data_mapping_id: [],
            pipeline_id: []
        }

    }


    componentDidUpdate(props) {

        if (props.data_mapping_id.length && !this.state.data_mapping_id.length)

            this.setState({data_mapping_id: props.data_mapping_id.map(data => (<option key={data.id} value={data.id}>{data.mapping_name}</option>))})

        if (props.pipeline_id.length && !this.state.pipeline_id.length)

            this.setState({pipeline_id: props.pipeline_id.map(data => (<option key={data.id} value={data.id}>{data.name}</option>))})

    }

    render = () => (
        <>
            <Form.Label><b>Side {this.props.side}</b></Form.Label>
            <Form.Group controlId={'file_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Raw File</Form.Label>
                    </Col>
                    <Col xs={8}>
                    <Form.File 
                        label='select file to upload'
                        custom
                        onChange={e => e.currentTarget.labels[1].innerHTML = e.target.files[0].name}
                    />
                    </Col>
                </Form.Row>
            </Form.Group>
            <Form.Group controlId={'source_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Source</Form.Label>
                    </Col>
                    <Col xs={8}>
                        <Form.Control placeholder='source' />
                    </Col>
                </Form.Row>
            </Form.Group>
            <Form.Group controlId={'data_mapping_id_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Data Mapping</Form.Label>
                    </Col>
                    <Col xs={8}>
                        <Form.Control as='select'>
                            {this.state.data_mapping_id}
                        </Form.Control>
                    </Col>
                </Form.Row>
            </Form.Group>
            <Form.Group controlId={'pipeline_id_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Pipeline</Form.Label>
                    </Col>
                    <Col xs={8}>
                        <Form.Control as='select'>
                            {this.state.pipeline_id}
                        </Form.Control>
                    </Col>
                </Form.Row>
            </Form.Group>
            <Form.Group controlId={'run_date_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Run Date</Form.Label>
                    </Col>
                    <Col xs={8}>
                        <Form.Control placeholder='run date' />
                    </Col>
                </Form.Row>
            </Form.Group>
            <Form.Group controlId={'sheet_name_' + this.props.side}>
                <Form.Row>
                    <Col xs={4}>
                        <Form.Label>Sheet Name</Form.Label>
                    </Col>
                    <Col xs={8}>
                        <Form.Control placeholder='sheet_name' />
                    </Col>
                </Form.Row>
            </Form.Group>
        </>
    )

}



RawFileForm.propTypes = {

    side: PropTypes.string.isRequired,
    data_mapping_id: PropTypes.array.isRequired,
    pipeline_id: PropTypes.array.isRequired

}