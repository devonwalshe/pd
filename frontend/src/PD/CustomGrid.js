import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'


export default class CustomGrid extends Component {

    constructor(props) {

        super(props)
    
    }



    getGridColumn = (side,item) => {

        const matched = typeof item.value === 'boolean' && !item.value
        const style = {color: matched ? 'yellow' : '#212529', backgroundColor: matched ? 'yellow' : 'white', padding:4}
        return (
            <div
                onClick={() => Number(this.props.clickFeature(item.row['id_' + side]))}
                style={style}
            >
                {matched ? '_' : item.value}
            </div>)

    }

    render() {
        
        const width = this.props.width ? this.props.width + "px" : "auto"

        return (<div style={{padding:10,width:width,maxWidth: width}}>
                    <ReactDataGrid
                        maxWidth={width}
                        columns={[
                            { 
                                key: "id_A",
                                name: "id_A",
                                editable: false,
                                sortable: false,
                                formatter: cell =>this.getGridColumn('A', cell)
                            },
                            {
                                key: "feature_A",
                                name: "feature_A",
                                editable: false,
                                sortable: false,
                                formatter: cell =>this.getGridColumn('A', cell)
                            },
                            {
                                key:"_gutter",
                                width:17,
                                formatter:()=>(<div style={{backgroundColor:'lightgray', padding:4}}>&nbsp;</div>)
                            },
                            { 
                                key: "id_B",
                                name: "id_B",
                                editable: false,
                                sortable: false,
                                formatter: cell =>this.getGridColumn('B', cell)
                            },
                            {
                                key: "feature_B",
                                name: "feature_B",
                                editable: false,
                                sortable: false,
                                formatter: cell =>this.getGridColumn('B', cell)
                            }
                        ]}
                        rowGetter={i => this.props.rows[i]}
                        rowsCount={this.props.rows.length}
                        onGridRowsUpdated={this.onGridRowsUpdated}
                        enableCellSelect={true}
                    />
                </div>
        )
    }
}


CustomGrid.propTypes = {

    rows: PropTypes.array.isRequired,
    clickFeature: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired

}
