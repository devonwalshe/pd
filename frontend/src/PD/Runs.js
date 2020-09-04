import React, { Component } from 'react'
import DataAdapter from './DataAdapter'
import ReactDataGrid from 'react-data-grid'
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap'


export default class Runs extends Component {

    constructor(props) {

        super(props)

        this.state = {

            rows:[]
            
        }

        this.dataAdapter = new DataAdapter()

    }


    componentDidMount = () => this.dataAdapter.get('run_matches', null, data => this.setState({rows: data}))
    

    render () {

        return (

            <div style={{width:'100%'}}>
                <div style={{margin:'0 auto', width:'800px'}}>
                    <Button variant="primary" onClick={this.props.newRun}>New</Button>
                    <div style={{height:10}}></div>
                    <ReactDataGrid
                        columns={
                            [
                                {
                                    key:'id',
                                    width: 10
                                },
                                {
                                    key: 'run_a',
                                    width: 10
                                },
                                {
                                    key: 'run_b',
                                    width: 10
                                },
                                {
                                    key: 'pipeline',
                                    width: 15
                                },
                                {
                                    key: 'section_count',
                                    width: 20
                                },
                                {
                                    key: 'sections_checked',
                                    width: 20
                                },
                                {
                                    key:'name',
                                    width: 15
                                }
                            ].map(col => {
                                return {
                                    key: col.key,
                                    name: col.key,
                                    editable: false,
                                    sortable: false,
                                    resizable: true,
                                    width: Math.floor((800 - 13) / 100 * col.width),
                                    minWidth: Math.floor((800 - 13) / 100 * col.width)
                                }
                            })
                        }
                        rowGetter={i => this.state.rows[i]}
                        rowsCount={this.state.rows.length}
                        onGridRowsUpdated={this.onGridRowsUpdated}
                        enableCellSelect={true}
                        rowRenderer={props => (
                            <div 
                                onClick={() => this.props.goRun(props.row.id)}
                                style={{cursor:'pointer'}}
                            >
                                <ReactDataGrid.Row {...props}/>
                            </div>
                        )}
                    />
                </div>
            </div>
        )

    }

}


Runs.propTypes = {

    goRun: PropTypes.func.isRequired,
    newRun: PropTypes.func.isRequired

}