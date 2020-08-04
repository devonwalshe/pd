import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'


export default class CustomGrid extends Component {

    constructor(props) {

        super(props)
    
    }

    getColumns = () => {

        let out = []

        const cols = [
            'feature_id',
            'feature',
            'feature_category',
            'orientation_deg',
            'us_weld_dist_wc_ft',
            'us_weld_dist_coord_m',
            'length_in',
            'width_in',
            'depth_in'
        ]

        cols.map(col => out.push({

            key: col + '_A',
            name: col + '_A',
            editable: false,
            sortable: false,
            formatter: cell =>this.getGridColumn('A', cell)

        }))

        out.push({

            key: '_gutter',
            width:17,
            formatter:()=>(<div style={{backgroundColor:'lightgray', padding:4}}>&nbsp;</div>)

        })

        cols.map(col => out.push({

            key: col + '_B',
            name: col + '_B',
            editable: false,
            sortable: false,
            formatter: cell =>this.getGridColumn('B', cell)

        }))

        return out

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

        return (
            <div style={{padding:10,width:width,maxWidth: width}}>
                <ReactDataGrid
                    maxWidth={width}
                    columns={(()=>this.getColumns())()}
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
