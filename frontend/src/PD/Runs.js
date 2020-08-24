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
                            ['id','run_a','run_b','pipeline','section_count','sections_checked','name'].map(col => {
                                return {
                                    key: col,
                                    name: col,
                                    editable: false,
                                    sortable: false,
                                    resizable: true,
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