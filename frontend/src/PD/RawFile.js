import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'
import DataAdapter from './DataAdapter'
import RawFileForm from './RawFileForm'
import ReactDataGrid from 'react-data-grid'

export default class RawFile extends Component {

    constructor(props) {

        super(props)
        this.state = {
            current: 0,
            step: null,
            form: {},
            rows: []
        }

        this.gridWidth = 800
        this.dataAdapter = new DataAdapter()
        this.dataAdapter.get('raw_files', null, data => this.setState({rows: data}))

        this.steps = [
            (
                <Form>
                    <RawFileForm side="A" />
                    <RawFileForm side="B" />
                    <Button variant='primary' onClick={this.submit}>Submit</Button>
                </Form>
            ),
            (
                <>
                    Upload success.
                </>
            )
    
        ]
    }


    componentDidMount = () => this.getStep()

    submit = () => {


        const getData = side => {

            let data = new FormData()
            
            data.append('file', document.getElementById('file_' + side).files[0])
            data.append('source', document.getElementById('source_' + side).value)
            data.append('data_mapping_id', document.getElementById('data_mapping_id_' + side).value)
            data.append('pipeline_id', document.getElementById('pipeline_id_' + side).value)
            data.append('run_date', document.getElementById('run_date_' + side).value)
            data.append('sheet_name', document.getElementById('sheet_name_' + side).value)

            return data

        }


        this.setState({confirm_screen: []}, () => {

            const data_a = getData('A')
            const data_b = getData('B')
        
            this.dataAdapter.upload(data_a, data => console.log(data))
            this.dataAdapter.upload(data_b, data => console.log(data))

            this.setState({current: this.state.current + 1}, this.getStep)
            
        })

    }


    getStep = () => this.setState({step: this.steps[this.state.current]})

    

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
                                key: 'filename',
                                width: 35
                            },
                            {
                                key: 'uploaded_at',
                                width: 45
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
                                        this.dataAdapter.delete('raw_file', arg.rowId, () => 
                                            this.dataAdapter.get('raw_files', null, data =>
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
                <h3>Add New</h3>
                {this.state.step}          
            </div>
            <br></br><br></br><br></br>
        </div>
                
            
    )

}
