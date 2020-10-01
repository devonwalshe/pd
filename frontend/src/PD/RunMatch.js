import React, { Component } from 'react'
import DataAdapter from './DataAdapter'
import ReactDataGrid from 'react-data-grid'
import PropTypes from 'prop-types'
import { Col, Button, Form } from 'react-bootstrap'
import fontawesome from '@fortawesome/fontawesome'
import { saveAs } from '@progress/kendo-file-saver'
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'

fontawesome.library.add(faDownload, faTrash)


export default class Runs extends Component {

    constructor(props) {

        super(props)

        this.state = {

            new_match_pipeline: [],
            new_match_runs: [],
            rows:[]
            
        }

        this.dataAdapter = new DataAdapter()

        this.dataAdapter.get(
            'inspection_runs',
            null,
            data => this.setState({new_match_runs: data.map(data => (<option key={data.id} value={data.id}>{data.id}</option>))})
        )
        this.dataAdapter.get(
            'pipelines',
            null,
            data => this.setState({new_match_pipeline: data.map(data => (<option key={data.id} value={data.id}>{data.name}</option>))})
        )

        this.dataAdapter.get('run_matches', null, data => this.setState({rows: data}))

    }


    addNew = () => {

        const name = document.getElementById('new_match_name').value
        const run_a = Number(document.getElementById('new_match_run_a').value)
        const run_b = Number(document.getElementById('new_match_run_b').value)
        const pipeline = Number(document.getElementById('new_match_pipeline').value)

        const data = [{
            name: name,
            run_a: run_a,
            run_b: run_b,
            pipeline: pipeline
        }]
        
        this.dataAdapter.post('run_match', data, () => {

            console.log(JSON.stringify(data))
            this.dataAdapter.get('run_matches', null, data => this.setState({rows: data}))
            
        })
        
    }

    downloadCSV = id => this.dataAdapter.get(

        'matchrunner/' + id + '/export',
        null,
        data => saveAs(new Blob([data], { type: 'text/plain;charset=utf-8' }), 'export.csv')

    )


    render = () => (

        <div style={{width:'100%'}}>
            <div style={{margin:'0 auto', width:'800px'}}>
                <ReactDataGrid
                    columns={
                        [
                            {
                                key:'id',
                                width: 10
                            },
                            {
                                key: 'run_a',
                                width: 9
                            },
                            {
                                key: 'run_b',
                                width: 9
                            },
                            {
                                key: 'pipeline',
                                width: 10
                            },
                            {
                                key: 'section_count',
                                width: 14
                            },
                            {
                                key: 'sections_checked',
                                width: 19
                            },
                            {
                                key:'name',
                                width: 13
                            },
                            {
                                key:'export',
                                width: 8,
                                formatter: cell => (
                                    <div style={{width: '100%', textAlign: 'center'}}>
                                        <i className="fa fa-download"></i>
                                    </div>
                                ),
                                events: {
                                    onClick: (e, arg) => this.downloadCSV(arg.rowId)
                                }
                            },
                            {
                                key:'delete',
                                width: 8,
                                formatter: cell => (
                                    <div style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                                        <i className="fa fa-trash"></i>
                                    </div>
                                ),
                                events: {
                                    onClick: (e, arg) =>
                                        this.dataAdapter.delete('run_match', arg.rowId, () => 
                                            this.dataAdapter.get('run_matches', null, data =>
                                                this.setState({rows: data})))
                                }
                            }
                        ].map(col => {
                            return {
                                key: col.key,
                                name: col.key,
                                editable: false,
                                sortable: false,
                                resizable: true,
                                width: Math.floor((800 - 13) / 100 * col.width),
                                minWidth: Math.floor((800 - 13) / 100 * col.width),
                                formatter: col.formatter || null,
                                events: col.events || {
                                    onClick: (e, arg) => this.props.goRun(arg.rowId)
                                }
                            }
                        })
                    }
                    rowGetter={i => this.state.rows[i]}
                    rowsCount={this.state.rows.length}
                    onGridRowsUpdated={this.onGridRowsUpdated}
                    enableCellSelect={true}
                    rowRenderer={props => (
                        <div
                            style={{cursor:'pointer'}}
                        >
                            <ReactDataGrid.Row {...props}/>
                        </div>
                    )}
                />
                <div style={{height:10}}></div>
                <Form>
                    <Form.Label><b>Add new</b></Form.Label>
                    <Form.Group controlId='new_match_name'>
                        <Form.Row>
                            <Col xs={4}>
                                <Form.Label>Name</Form.Label>
                            </Col>
                            <Col xs={8}>
                                <Form.Control placeholder='Enter name of new match' />
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Form.Group controlId='new_match_run_a'>
                        <Form.Row>
                            <Col xs={4}>
                                <Form.Label>Run A</Form.Label>
                            </Col>
                            <Col xs={8}>
                                <Form.Control as='select' placeholder='Select Run A' >
                                    {this.state.new_match_runs}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Form.Group controlId='new_match_run_b'>
                        <Form.Row>
                            <Col xs={4}>
                                <Form.Label>Run B</Form.Label>
                            </Col>
                            <Col xs={8}>
                                <Form.Control as='select' placeholder='Select Run B'>
                                    {this.state.new_match_runs}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Form.Group controlId='new_match_pipeline'>
                        <Form.Row>
                            <Col xs={4}>
                                <Form.Label>Pipeline</Form.Label>
                            </Col>
                            <Col xs={8}>
                                <Form.Control as='select' placeholder='Select Run B'>
                                    {this.state.new_match_pipeline}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Button variant='primary' onClick={this.addNew}>Add</Button>
                </Form>
            </div>
        </div>
    )

}


Runs.propTypes = {

    goRun: PropTypes.func.isRequired

}