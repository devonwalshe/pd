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
            gridColumns: JSON.parse(JSON.stringify(this.gridColumns)),
            adjColumns: [],
            adjWidths: [],
            totalPercent: 0
        }

    }

    _isMounted = false

    componentDidMount() {

        this._isMounted = true

        this.setAdjGrid()

    }

    componentWillUnmount() {

        this._isMounted = false

    }

    


    setAdjGrid = () => {

        if (!this._isMounted)
        
            return

        const fltr = this.state.gridColumns.filter(col => col.show)

        let total = 0

        const cols = (()=> 
            fltr.map(col => {
                total += col.width
                return {
                    name: col.key,
                    title: col.name
                }
            })
        )()

        const widths = (() => 
            fltr.map(col => {
                return {
                    columnName: col.key,
                    width: 800 / 100 * col.width
                }
            })
        )()

        this.setState({adjColumns: cols, adjWidths: widths, totalPercent: total})

    }

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
console.log('get', this.state.gridColumns, this.getColumns)
        let out = []

        if (this.props.width < 0)

            return out


        const gutterWidth = 15
        const scrollBarWidth = 16
        const fltr = this.state.gridColumns.filter(col => col.show)
        const pixPerPercent = (this.props.width - gutterWidth - scrollBarWidth) / 2 / 100

        const side = s => fltr.map(col => out.push({

            key: col.key + '_' + s,
            name: col.name,
            editable: false,
            sortable: false,
            resizable: true,
            width: col.width * pixPerPercent,
            formatter: cell => this.getGridColumn(s, cell)

        }))

        side('A')

        out.push({

            key: '_gutter',
            width: gutterWidth,
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
        const adjWidth = "800px"

        const handleClose = () => this.setState({gridColumns: JSON.parse(JSON.stringify(this.gridColumns)), showModal: false})
        const handleShow = () => this.setState({showModal: true}, this.setAdjGrid)

        return (
            <div className="custom-grid" style={{width:width, maxWidth: width}}>
                <Modal
                    show={this.state.showModal}
                    onHide={handleClose}
                    dialogClassName="grid_adj"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Customize Grid Columns</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-grid-adj">
                        <Paper style={{
                                margin: 0,
                                width: adjWidth
                            }}>
                        <Grid
                            rows={[]}
                            columns={this.state.adjColumns}
                            style={{
                                margin: 0,
                                maxWidth: adjWidth,
                                width: adjWidth
                            }}
                        >
                            <Table />
                            <TableColumnResizing
                                columnWidths={this.state.adjWidths}
                                onColumnWidthsChange={e => {
                                    const cols = [...this.state.gridColumns]
                                    for (let i = 0, ix = e.length; i < ix; i += 1)
                                        for (let j = 0, jx = cols.length; j < jx; j += 1)
                                            if (e[i].columnName === cols[j].key && e[i].width !== 800 / 100 * cols[j].width)
                                                cols[j].width = Math.round(e[i].width / 800 * 100)
                                    this.setAdjGrid()
                                    this.setState({ gridColumns: cols })
                                }}
                            />
                            <TableHeaderRow />
                        </Grid>
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
                                {(() => this.state.gridColumns.map((col, ind) => (
                                    <tr key={"adj_col_" + ind}>
                                        <td>
                                            <Form.Check type="checkbox" id={"col_" + ind} checked={col.show}
                                                onChange={e => {
                                                    const cols = [...this.state.gridColumns]
                                                    cols[ind].show = e.target.checked
                                                    this.setAdjGrid()
                                                    this.setState({ gridColumns: cols })
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {col.key}
                                        </td>
                                        <td>
                                            <Form.Control
                                                value={this.state.gridColumns[ind].name}
                                                onChange={e => {
                                                    const cols = [...this.state.gridColumns]
                                                    cols[ind].name = e.target.value
                                                    this.setAdjGrid()
                                                    this.setState({ gridColumns: cols })
                                                }}
                                            />
                                        </td>
                                        <td style={{textAlign:"center",verticalAlign: "middle"}}>
                                            <i className="fa fa-arrow-up"></i>
                                            <i className="fa fa-arrow-down"></i>
                                        </td>
                                        <td>
                                            <Form.Control style={{width: "80px"}} 
                                                onChange={e => {
                                                    const cols = [...this.state.gridColumns]
                                                    cols[ind].width = Number(e.target.value)    
                                                    this.setAdjGrid()
                                                    this.setState({ gridColumns: cols })
                                                }}
                                                value={this.state.gridColumns[ind].width}
                                            />
                                        </td>
                                    </tr>
                                )))()}
                                <tr>
                                    <td colSpan="4"></td>
                                    <td>{this.state.totalPercent}</td>
                                </tr>
                            </tbody>
                        </BootTable>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    <Button variant="primary" onClick={() => {
                        handleClose
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
                    columns={(() => this.getColumns())()}
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
