import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDataGrid from "react-data-grid"
import fontawesome from "@fortawesome/fontawesome"
import { faCog, faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons"
import Paper from "@material-ui/core/Paper"
import {
  Grid,
  Table,
  TableHeaderRow,
  TableColumnResizing,
} from "@devexpress/dx-react-grid-material-ui"
import { Modal, Button, Table as BootTable, Form } from "react-bootstrap"
import "../grid_style.css"

fontawesome.library.add(faCog, faArrowUp, faArrowDown)


export default class CustomGrid extends Component {


    constructor(props) {

        super(props)

        this.state = {
            showModal: false,
            gridColumns: this.props.gridColumns.map(col => Object.assign({}, col)),
            adjColumns: [],
            adjWidths: [],
            totalPercent: 0,
            keyLock: false
        }

        this.adjGridWidth = 800

    }


    componentDidMount() {

        this.setAdjGrid()

    }


    componentDidUpdate() {

        if (this.state.keyLock !== this.props.keyLock)

            this.setState({

                keyLock: this.props.keyLock

            })

    }


    getColumns = () => {

        let out = []

        if (this.props.width < 0)

            return out


        const gutterWidth = 15
        const scrollBarWidth = 16
        const fltr = this.state.gridColumns.filter(col => col.show)
        const pixPerPercent = (this.props.width - gutterWidth - scrollBarWidth) / 2 / 100

        const side = s => fltr.map(col => out.push({

            key: col.key + "_" + s,
            name: col.name,
            editable: false,
            sortable: false,
            resizable: true,
            width: col.width * pixPerPercent,
            formatter: cell => this.getGridColumn(s, cell)

        }))

        side("A")

        out.push({

            key: "match_pair",
            width: gutterWidth,
            formatter: cell => (
                <div 
                    style={{
                        cursor: cell.value ? "pointer" : "default",
                        color: cell.value ? "inherit" : "lightgray",
                        backgroundColor:"lightgray",
                        fontSize: "11px",
                        padding:4
                    }}
                    onClick={() => cell.value && this.props.unlink(Number(cell.value))}
                >X</div>
            )

        })

        side("B")

        return out

    }


    getGridColumn = (side,item) => {

        const matched = typeof item.value === "boolean" && !item.value
        
        const style = {
            
            color: matched ? "yellow" : "#212529",
            cursor: this.state.keyLock ? "pointer" : "default",
            backgroundColor: matched ? "yellow" : "white",
            padding: 4,
            fontSize: "0.7rem"
        
        }

        return (
            <div
                name={!matched ? item.row["id_" + side] : "not_matched"}
                onClick={() => this.props.clickFeature(item.row["id_" + side])}
                onMouseOver={e => {
                 
                    e.currentTarget.style.cursor = this.state.keyLock ? "pointer" : "default"
                    this.props.hoverFeature(item.row["id_" + side])
                
                }}
                style={style}
            >
                {matched ? "_" : item.value}
            </div>
        )

    }

    setAdjGrid = () => {

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
                    width: this.adjGridWidth / 100 * col.width
                }
            })
        )()

        this.setState({adjColumns: cols, adjWidths: widths, totalPercent: total})

    }

    

    setGridSides = () => {

        var children = document.querySelectorAll(".custom-grid .react-grid-Container .react-grid-Main .react-grid-Grid .react-grid-Header .react-grid-HeaderRow")

        if (children)

            children = children[0].children[0].children

        for (let i = 0, ix = (children || []).length, mid = (ix - 1) / 2; i < ix; i += 1)

            if (i < mid)

                children[i].style.borderTop = "3px solid orange"

            else if (i > mid)

                children[i].style.borderTop = "3px solid blue"

            else if (i === mid)

                children[i].style.borderTop = "3px solid white"


    }

    render() {
        
        const width = this.props.width ? this.props.width + "px" : "auto"
        const adjWidth = "800px"

        const handleClose = () => this.setState({gridColumns: JSON.parse(JSON.stringify(this.state.gridColumns)), showModal: false})
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
                        <Paper
                            style={{
                                margin: 0,
                                width: adjWidth
                            }}
                        >
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
                                            <div
                                                style={{
                                                    cursor: "pointer",
                                                    display: "inline-block"
                                                }}
                                                onClick={() => {
                                                    if (ind) {
                                                        let cols = this.state.gridColumns.map(col => Object.assign({}, col))
                                                        cols[ind - 1] = cols.splice(ind, 1, cols[ind - 1])[0]
                                                        this.setAdjGrid()
                                                        console.log(cols)
                                                        this.setState({ gridColumns: [] }, () => this.setState({ gridColumns: cols }))
                                                    }
                                                }}
                                            >
                                                <i className="fa fa-arrow-up"></i>
                                            </div>
                                            <div
                                                style={{
                                                    cursor: "pointer",
                                                    display: "inline-block"
                                                }}
                                                onClick={() => {
                                                    if (ind < this.state.gridColumns.length - 1) {
                                                        let cols = this.state.gridColumns.map(col => Object.assign({}, col))
                                                        cols[ind] = cols.splice(ind + 1, 1, cols[ind])[0]
                                                        this.setAdjGrid()
                                                        this.setState({ gridColumns: [] }, () => this.setState({ gridColumns: cols }))
                                                    }
                                                }}
                                            >
                                                <i className="fa fa-arrow-down"></i>
                                            </div>
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
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleClose()
                        }}>
                            Save Changes
                        </Button>   
                    </Modal.Footer>
                </Modal>
                <div
                    style={{
                        cursor: "pointer",
                        display: "inline-block"
                    }}
                    onClick={handleShow}
                >
                    <i className="fa fa-cog"></i>
                </div>
                <ReactDataGrid
                    maxWidth={width}
                    columns={(() => {
                        setTimeout(this.setGridSides, 20)
                        return this.getColumns()
                    })()}
                    rowGetter={i => this.props.rows[i]}
                    rowsCount={this.props.rows.length}
                    onGridRowsUpdated={()=>{

                        this.onGridRowsUpdated()
                        this.blur()
                        
                    }}
                    enableCellSelect={true}
                />
            </div>
        )
    }
}


CustomGrid.propTypes = {

    rows: PropTypes.array.isRequired,
    gridColumns: PropTypes.array.isRequired,
    clickFeature: PropTypes.func.isRequired,
    hoverFeature: PropTypes.func.isRequired,
    unlink: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    keyLock: PropTypes.bool.isRequired

}
