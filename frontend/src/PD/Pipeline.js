import React, { Component } from 'react'
import DataAdapter from './DataAdapter'
import ReactDataGrid from 'react-data-grid'
import { Button, Col, Form } from 'react-bootstrap'
import fontawesome from '@fortawesome/fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

fontawesome.library.add(faTrash)


export default class Pipeline extends Component {


    constructor(props) {

        super(props)

        this.state = {

            rows:[]
            
        }

        this.dataAdapter = new DataAdapter()

        this.dataAdapter.get('pipelines', null, data => this.setState({rows: data}))

        this.gridWidth = 800

    }

    addNew = () => this.dataAdapter.post(
        
        'pipeline',
        [{name: document.getElementById('new_pipe_name').value}],
        () => this.dataAdapter.get('pipelines', null, data => this.setState({rows: data}))
    
    )


    render = () => (

        <div style={{width:'100%'}}>
            <div style={{margin:'0 auto', width: this.gridWidth + 'px'}}>
                <ReactDataGrid
                    columns={
                        [
                            {
                                key:'id',
                                width: 20
                            },
                            {
                                key: 'name',
                                width: 70
                            },
                            {
                                key:'delete',
                                width: 10,
                                formatter: cell => (
                                    <div style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                                        <i className="fa fa-trash"></i>
                                    </div>
                                ),
                                events: {
                                    onClick: (e, arg) =>
                                        this.dataAdapter.delete('pipeline', arg.rowId, () => 
                                            this.dataAdapter.get('pipelines', null, data =>
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
                                formatter: col.formatter || null,
                                width: Math.floor((this.gridWidth - 13) / 100 * col.width),
                                minWidth: Math.floor((this.gridWidth - 13) / 100 * col.width),
                                events: col.events || {}
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
