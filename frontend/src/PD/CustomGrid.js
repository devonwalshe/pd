import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'


export default class CustomGrid extends Component {


    getColumns = () => {

        let out = []

        const cols = [
            {width: 75, col: 'feature_id'},
            {width: 60, col: 'feature'},
            {width: 115, col: 'feature_category'},
            {width: 110, col: 'orientation_deg'},
            {width: 130, col: 'us_weld_dist_wc_ft'},
            {width: 145, col: 'us_weld_dist_coord_m'},
            {width: 70, col: 'length_in'},
            {width: 70, col: 'width_in'},
            {width: 70, col: 'depth_in'}
        ]

        const side = s => cols.map(col => out.push({

            key: col.col + '_' + s,
            name: col.col + '_' + s,
            editable: false,
            sortable: false,
            resizable: true,
            width: col.width,
            formatter: cell =>this.getGridColumn(s, cell)

        }))

        side('A')
        out.push({

            key: '_gutter',
            width: 17,
            formatter: cell => (
                <div 
                    style={{
                        cursor: cell.value ? 'pointer' : 'arrow',
                        color: cell.value ? 'inherit' : 'lightgray',
                        backgroundColor:'lightgray',
                        padding:4
                    }}
                    onClick={() => cell.value && this.props.unlink(Number(cell.value))}
                >X</div>
            )

        })
        side('B')

        return out

    }

    getGridColumn = (side,item) => {

        const matched = typeof item.value === 'boolean' && !item.value
        
        const style = {color: matched ? 'yellow' : '#212529', backgroundColor: matched ? 'yellow' : 'white', padding:4, fontSize:'0.7rem'}
        return (
            <div
                name={!matched ? item.row['id_' + side] : 'not_matched'}
                onClick={() => this.props.clickFeature(item.row['id_' + side])}
                onMouseOver={() => this.props.hoverFeature(item.row['id_' + side])}
                style={style}
            >
                {matched ? '_' : item.value}
            </div>)

    }

    render() {
        
        const width = this.props.width ? this.props.width + "px" : "auto"

        return (
            <div className="custom-grid" style={{width:width,maxWidth: width}}>
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
    hoverFeature: PropTypes.func.isRequired,
    unlink: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired

}
