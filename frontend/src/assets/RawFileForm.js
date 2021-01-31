import React, { Component } from 'react'
import { Col, Form } from 'react-bootstrap'
import DataAdapter from './DataAdapter'
import PropTypes from 'prop-types'


export default class RawFileForm extends Component {

    constructor(props) {

        super(props)

        this.state = {
            data_mapping_id: [],
            pipeline_id: []
        }

        this.dataAdapter = new DataAdapter()

    }


    _isMounted = false


    componentDidMount() {

        this._isMounted = true;

        this.dataAdapter.get(
            'feature_maps',
            null,
            data => this._isMounted && this.setState({data_mapping_id: data.map(data => (<option key={data.id} value={data.id}>{data.mapping_name}</option>))})
        )

        this.dataAdapter.get(
            'pipelines',
            null,
            data => this._isMounted && this.setState({pipeline_id: data.map(data => (<option key={data.id} value={data.id}>{data.name}</option>))})
        )

    }


    componentWillUnmount() {

        this._isMounted = false

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

    side: PropTypes.string.isRequired

}