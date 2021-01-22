import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'


export default class CustomGrid extends Component {


    getColumns = () => {

        let out = []

        if (this.props.width < 0)

            return out

        const getWidth = percent => this.props.width / 100 * percent

        const cols = [
            {width: getWidth(4.5), col: 'feature_id'},
            {width: getWidth(3.5), col: 'feature'},
            {width: getWidth(6.5), col: 'feature_category'},
            {width: getWidth(6.5), col: 'orientation_deg'},
            {width: getWidth(8), col: 'us_weld_dist_wc_ft'},
            {width: getWidth(9), col: 'us_weld_dist_coord_m'},
            {width: getWidth(4), col: 'length_in'},
            {width: getWidth(3.5), col: 'width_in'},
            {width: getWidth(3.5), col: 'depth_in'}
        ]

        const side = s => cols.map(col => out.push({

            key: col.col + '_' + s,
            name: col.col,
            editable: false,
            sortable: false,
            resizable: true,
            width: col.width,
            formatter: cell =>this.getGridColumn(s, cell)
        }))

        side('A')
        out.push({

            key: '_gutter',
            width: getWidth(1),
            formatter: cell => (
                <div 
                    style={{
                        cursor: cell.value ? 'pointer' : 'arrow',
                        color: cell.value ? 'inherit' : 'lightgray',
                        backgroundColor:'lightgray',
                        fontSize: '11px',
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
