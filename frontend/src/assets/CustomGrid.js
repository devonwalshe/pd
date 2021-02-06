import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid'
import fontawesome from '@fortawesome/fontawesome'
import { faCog, faArrowDown, faArrowUp} from '@fortawesome/free-solid-svg-icons'
import Paper from '@material-ui/core/Paper'
import {
  Grid,
  Table,
  TableHeaderRow,
  TableColumnResizing,
} from '@devexpress/dx-react-grid-material-ui'
import { Modal, Button, Table as BootTable, Form } from 'react-bootstrap'
import '../grid_style.css'

fontawesome.library.add(faCog, faArrowUp, faArrowDown)


export default class CustomGrid extends Component {


    constructor(props) {

        super(props)

        this.state = {
            showModal: false,
            adjustment_grid: this.getAdjustmentGrid(),
            gridColumns: this.gridColumns
        }

    }

    getAdjustmentGrid = () => (
        <Grid
            rows={[]}
            columns={(()=> 
                this.gridColumns.map(col => {
                    return {
                        name: col.key,
                        title: col.name
                    }
                })
            )()}
            style={{
                margin: 0,
                width: "800px"
            }}
        >
            <Table />
            <TableColumnResizing defaultColumnWidths={(() => 
                this.gridColumns.map(col => {console.log(col.width)

                    return {
                        columnName: col.key,
                        width: 800 / 100 * col.width
                    }
                })
            )()}
            />
            <TableHeaderRow />
        </Grid>
    )

    gridColumns = [
        {width:11, name: 'feature_id', key:'feature_id', show: true},
        {width: 7, name: 'feature', key:'feature', show: true},
        {width: 13, name: 'feature_category', key:'feature_category', show: true},
        {width: 13, name: 'orientation_deg', key:'orientation_deg', show: true},
        {width: 16, name: 'us_weld_dist_wc_ft', key:'us_weld_dist_wc_ft', show: true},
        {width: 18, name: 'us_weld_dist_coord_m', key:'us_weld_dist_coord_m', show: true},
        {width: 8, name: 'length_in', key:'length_in', show: true},
        {width: 7, name: 'width_in', key:'width_in', show: true},
        {width: 7, name: 'depth_in', key:'depth_in', show: true}
    ]


    getColumns = () => {

        let out = []

        if (this.props.width < 0)

            return out

        const getWidth = percent => this.props.width / 100 * percent

        const side = s => this.gridColumns.map(col => out.push({

            key: col.key + '_' + s,
            name: col.name,
            editable: false,
            sortable: false,
            resizable: true,
            width: getWidth(col.width / 2),
            formatter: cell => this.getGridColumn(s, cell)
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

        const handleClose = () => this.setState({showModal: false})
        const handleShow = () => this.setState({showModal: true})

        const columns = this.gridColumns.map(col => {
            return {
                name: col.key,
                title: col.name
            }
        })
        const rows = []
        const defaultColumnWidths = this.gridColumns.map(col => {
            return {
                columnName: col.key,
                width: 800 / 100 * col.width
            }
        })


//https://codesandbox.io/s/oo1nz?file=/demo.js
        return (
            <div className="custom-grid" style={{width:width, maxWidth: width}}>
                <Modal show={this.state.showModal} onHide={handleClose} dialogClassName="grid_adj">
                    <Modal.Header closeButton>
                        <Modal.Title>Customize Grid Columns</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-grid-adj">
                        <Paper>
                            {this.state.adjustment_grid}
                        </Paper>
                        <br></br><br></br>
                        <BootTable bordered hover>
                            <thead>
                                <tr>
                                <th></th>
                                <th>Key</th>
                                <th>Name</th>
                                <th>Order</th>
                                <th>Width</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => this.gridColumns.map((col, ind) => (
                                    <tr key={"adj_col_" + ind}>
                                        <td>
                                        <Form.Check type="checkbox" id={"col_" + ind} checked={col.show}
                                            onChange={e => {
                                                console.log(e.target.checked)
                                                e.target.checked = e.target.checked
                                            }}
                                        />
                                        </td>
                                        <td>
                                            {col.key}
                                        </td>
                                        <td>
                                            <Form.Group controlId={"name_" + ind}
                                               >
                                                <Form.Control
                                                    value={this.state.gridColumns[ind].name}
                                                    onChange={e => {
                                                        this.gridColumns[ind].name = e.target.value
                                                        this.setState({ gridColumns: this.gridColumns })
                                                    }}
                                                />
                                            </Form.Group>
                                        </td>
                                        <td>
                                            <i className="fa fa-arrow-up"></i>
                                            <i className="fa fa-arrow-down"></i>
                                        </td>
                                        <td>
                                            <Form.Group>
                                                <Form.Control style={{width: "80px"}} 
                                                    onChange={e => {
                                                        this.gridColumns[ind].width = Number(e.target.value)
                                                        console.log(this.getAdjustmentGrid())
                                                        this.setState({ gridColumns: this.gridColumns }, () => this.setState({adjustment_grid: []}, this.setState({adjustment_grid: this.getAdjustmentGrid()})))
                                                    }}
                                                    value={this.state.gridColumns[ind].width}
                                                />
                                            </Form.Group>
                                        </td>
                                    </tr>
                                )))()}
                            </tbody>
                        </BootTable>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    <Button variant="primary" onClick={() => {

console.log(document.getElementsByClassName("custom-grid-adj")[0].childNodes[0])
                        const nodes = document.getElementsByClassName("custom-grid-adj")[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes
console.log(nodes)
let sum = 0
                        for (let i = 0, ix = nodes.length; i < ix; i += 1) {

sum += nodes[i].offsetWidth
                            console.log(nodes[i].offsetWidth)

                        }
                        console.log(sum)
                        //handleClose
                    }}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                </Modal>
                <div onClick={handleShow}>
                    <i className="fa fa-cog"></i>
                </div>
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
