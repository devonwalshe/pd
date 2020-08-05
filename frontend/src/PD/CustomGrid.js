import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'


export default class CustomGrid extends Component {


    getColumns = () => {

        let out = []

        const cols = [
            {width: 10, col: 'feature_id'},
            {width: 10, col: 'feature'},
            {width: 10, col: 'feature_category'},
            {width: 10, col: 'orientation_deg'},
            {width: 10, col: 'us_weld_dist_wc_ft'},
            {width: 10, col: 'us_weld_dist_coord_m'},
            {width: 10, col: 'length_in'},
            {width: 10, col: 'width_in'},
            {width: 10, col: 'depth_in'}
        ]

        const side = s => cols.map(col => out.push({

            key: col.col + '_' + s,
            name: col.col + '_' + s,
            //width: col.width,
            editable: false,
            sortable: false,
            resizable: true,
            formatter: cell =>this.getGridColumn(s, cell)

        }))

        side('A')
        out.push({

            key: '_gutter',
            width: 17,
            formatter: () => (<div style={{backgroundColor:'lightgray', padding:4}}>&nbsp;</div>)

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
    hoverFeature: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired

}
