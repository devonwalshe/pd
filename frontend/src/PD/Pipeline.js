import React, { Component } from 'react'
import DataAdapter from './DataAdapter'
import ReactDataGrid from 'react-data-grid'
import { Button, Col, Form } from 'react-bootstrap'


export default class Pipeline extends Component {


    constructor(props) {

        super(props)

        this.state = {

            rows:[]
            
        }

        this.dataAdapter = new DataAdapter()

        this.dataAdapter.get('pipelines', null, data => this.setState({rows: data}))

    }

    addNew = () => this.dataAdapter.post(
        
        'pipeline',
        [{name: document.getElementById('new_pipe_name').value}],
        () => this.dataAdapter.get('pipelines', null, data => this.setState({rows: data}))
    
    )


    render = () => (

            <div style={{width:'100%'}}>
            <div style={{margin:'0 auto', width:'800px'}}>
                <ReactDataGrid
                    columns={
                        [
                            {
                                key:'id',
                                width: 20
                            },
                            {
                                key: 'name',
                                width: 80
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
                            }
                        })
                    }
                    rowGetter={i => this.state.rows[i]}
                    rowsCount={this.state.rows.length}
                    onGridRowsUpdated={this.onGridRowsUpdated}
                    enableCellSelect={false}
                />
                <div style={{height:10}}></div>
                
                <Form>
                    <Form.Label><b>Add new</b></Form.Label>
                    <Form.Group>
                        <Form.Row>
                            <Col>
                                <Form.Label>Name</Form.Label>
                            </Col>
                            <Col>
                                <Form.Control id='new_pipe_name' type='text' placeholder='Enter name of new pipeline' />
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Button variant='primary' onClick={this.addNew}>Add</Button>
                </Form>
            </div>
        </div>
                
            
    )

}
