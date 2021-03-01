import React, { Component } from "react"
import CustomGrid from "./CustomGrid"
import APIClient from "./APIClient.js"
import Axes from "./Axes"
import WeldsTable from "./WeldsTable"
import Ctrl from "./Ctrl"
import { Modal, Button, Table as BootTable, Form } from "react-bootstrap"

export default class Discovery extends Component {

    constructor(props) {

        super(props)

        this.state = {

            confirm_on: false,
            nav_status: "0000",
            run_name: "",
            featuresPlot: {},
            keyLock: false,
            pipe_section_table: [],
            welds: {},
            manually_checked: false,
            max_weld_width: 0,
            sectionIndex: 0,
            sectionTotal: 0,
            table_width: 800

        }

        this.apiClient = new APIClient()

        this.filter = {
            matched:true,
            unmatched: true
        }
        
        this.pipe_sections = {
            data: [],
            index: 0,
            id: 0
        }

        this.rawData = {}
        this.run_match = window.location.href.split("/").slice(-1)[0]
        this.first_match = 0
        this.second_match = 0
        this.hover = {
            graph: 0,
            table: 0
        }
        this.bgHi = "yellow"
        this.lossLimit = null

    }
    
    _isMounted = false


    componentWillUnmount() {
        this._isMounted = false
    }

    componentDidMount() {

        this._isMounted = true

        this.getGraphWidth()
        
        this.apiClient.callAPI({
            
            endpoint: "run_match",
            
            data: this.run_match + "/pipe_sections",
            
            callback: data => {

                this.pipe_sections = {
                    data: data,
                    id: data[0].id,
                    index: 0
                }

                this.navStatus()
                this.loadPipeSection()
                this.setState({
                    
                    sectionIndex: this.pipe_sections.index + 1,

                    sectionTotal: this.pipe_sections.data.length

                })

            }

        })

        this.apiClient.callAPI({

            endpoint: "run_match",
            data: this.run_match,
            callback: data => this.setState({run_name: data.name})

        })

    
        window.addEventListener("resize", () => {

            clearTimeout(this.resizeTimer)

            this.resizeTimer = setTimeout(this.getGraphWidth, 250)

        })


        document.onkeydown = e => {

            e = e || window.event

            if (e.ctrlKey)

                this.setState({keyLock: true})

        }


        document.onkeyup = e => {

            e = e || window.event

            if (e.key === "Control") {

                this.setState({
                    keyLock: false
                })

                document.getElementById("plot_area").className = ""

                this.highlightDom(this.first_match, "transparent")
                this.highlightDom(this.second_match, "transparent")
                
                if (!this.second_match)

                    this.first_match = 0
                    
                this.graphPipeSection()

                setTimeout(() => this.highlightTable(this.first_match, "transparent"), 100)
                setTimeout(() => this.highlightTable(this.second_match, "transparent"), 100)


            }

        }

        
    }

    resizeTimer = null

    cancelMatch = () => {

        document.getElementById("plot_area").className = ""
        this.highlightDom(this.first_match, "transparent")
        this.highlightDom(this.second_match, "transparent")
        setTimeout(() => this.highlightTable(this.first_match, "transparent"), 100)
        setTimeout(() => this.highlightTable(this.last_match, "transparent"), 100)
        this.first_match = 0
        this.second_match = 0

    }

    clickFeature = id => {
        
        if (this.second_match || (this.state.featuresPlot[id] && this.state.featuresPlot[id].matched))

            return

        if (this.first_match) {

            if (this.rawData.features[this.first_match].side === this.rawData.features[id].side)

                return

            this.highlightDom(id, this.bgHi)
            this.second_match = id

            this.setState({
                confirm_on: true
            }, () => this.setState({...this.state}))

        } else {

            this.first_match = id
            document.getElementById("plot_area").className = "match_on"
            this.graphPipeSection()
            setTimeout(() => this.highlightTable(id, this.state.featuresPlot[id].side === "A" ? "#fed8b1" : "lightblue"), 100)

        }

    }


    getGraphWidth = () => this._isMounted && this.setState({

        table_width: parseFloat(document.getElementById("grid_container").getBoundingClientRect().width)

    }, this.graphPipeSection)


    graphPipeSection = () => {

        const data = this.rawData.features

        let features = {}

        for (let f in data) {
 
            const filtered = (this.filter.matched && data[f].matched) || (this.filter.unmatched && !data[f].matched)

            if (filtered && (!this.first_match || (this.first_match === data[f].id || (data[this.first_match].side !== data[f].side && !data[f].matched))))

                features[data[f].id] = {

                    ...data[f],
                    firstMatch: this.first_match

                }

        }

        
        if (this.lossLimit && this.lossLimit < this.rawData.sizes.length)

            for (let f in features)
                
                if (features[f].size && features[f].size < this.rawData.sizes[this.lossLimit])

                    delete features[f]


        const getTableRow = (a, b, pair) => {

            const side = (obj, side) => {

                const attr = (obj && obj.attributes) || null
                
                let out = {

                    ["id_" + side]: (obj && obj.id) || false,
                    ["feature_id_" + side]: (obj && obj.feature_id) || false

                }
                
                this.gridColumns.filter(col => col.type).forEach(col => {

                    out[col.key + "_" + side] = (attr && ({

                        num: key => (attr[key] && Number(attr[key]).toFixed(4)) || " ",
                        str: key => attr[key] || " "

                    })[col.type](col.key)) || false
                    
                })

                return out
                
            }

            return{
    
                ...side(a, "A"),
                match_pair: a && b ? pair : false,
                ...side(b, "B"),
    
            }
    
        }

        let table = []

        const tableRaw = this.rawData.table || []
        
        tableRaw.forEach(row => {
                
            const a = (row.A && features[row.A.id] && row.A) || null
            const b = (row.B && features[row.B.id] && row.B) || null

            if (a || b)

                table.push(getTableRow(a, b, row.match_pair))

        })

        this.setState({
            
            featuresPlot: features,
            pipe_section_table: table
            
        })

    }


    gridColumns = [
        {
            width: 11,
            name: "ID",
            key:"feature_id",
            show: true
        },
        {
            width: 7,
            name: "Feature",
            key:"feature",
            show: true,
            type: "str"
        },
        {
            width: 13,
            name: "feature_category",
            key:"feature_category",
            show: false,
            type: "str"
        },
        {
            width: 13,
            name: "Distance",
            key: "us_weld_dist_wc_ft",
            show: true,
            type: "num"
        },
        {
            width: 21,
            name: "Dist. from US Weld",
            key:"us_weld_dist_coord_m",
            show: true,
            type: "num"
        },
        {
            width: 7,
            name: "Depth",
            key:"depth_in",
            show: true,
            type: "num"
        },
        {
            width: 8,
            name: "Length",
            key:"length_in",
            show: true,
            type: "num"
        },
        {
            width: 7,
            name: "Width",
            key:"width_in",
            show: true,
            type: "num"
        },
        {
            width: 13,
            name: "Orientation",
            key:"orientation_deg",
            show: true,
            type: "num"
        },
        {
            width: 13,
            name: "Comments",
            key:"comments",
            show: true,
            type: "str"
        }
    ]

    
    highlightDom = (id, color) => {

        const doc = document.getElementById(id)

        if (doc && !doc.childNodes.length && color === "transparent")

            doc.style.backgroundColor = doc.style.borderColor
        
        else if (doc)

            doc.style.backgroundColor = color

    }


    highlightTable = (id, color) => {

        const docs = document.getElementsByName(id)

        for (let i = 0, ix = docs.length; i < ix; i += 1)

            docs[i].style.backgroundColor = color

    }

    navStatus = filter => {

        const p = this.pipe_sections
        const ln = p.data.length

        let n

        if (!ln)

            n = "0000"

        else if (!p.index)

            n = "0011"

        else if (p.index === (ln - 1))

            n = "1100"

        else {

            let nx = [0,1,1,0]

            for (let i = p.index - 1; i > -1; i -= 1)

                if (p.data[i].manually_checked && (!filter || p.data[i].feature_count)) {

                    nx[0] = 1
                    i = -1

                }

            for (let i = p.index + 1; i < ln; i += 1)

                if (p.data[i].manually_checked && (!filter || p.data[i].feature_count)) {

                    nx[3] = 1
                    i = ln

                }

            n = nx.join("")

        }

        this.setState({nav_status: n})

    }

    hoverOnGraph = id => {
        
        this.hover.table && this.highlightTable(this.hover.table, "transparent")
        this.hover.table = id
        id && this.highlightTable(id, "lightblue")

    }

    hoverOnTable = id => {
        
        if (!id)

            return

        if (this.hover.graph && 
            this.first_match !== this.hover.graph &&
            this.second_match !== this.hover.graph) {
        
            this.highlightDom(this.hover.graph, "transparent")

        }

        this.hover.graph = id
        this.highlightDom(id, this.bgHi)

    }


    loadPipeSection = () => {
        
        this.apiClient.callAPI({
            
            endpoint: "pipe_section",
            
            data: this.pipe_sections.id,
            
            callback: data => {
            
                let raw = {

                    id: data.id,
                    section_id: data.section_id,
                    run_match: data.run_match,
                    run_name: data.name,
                    manually_checked: data.manually_checked,
                    features: {},
                    table: [],
                    sizes: [],
                    weld_a_width: 0,
                    weld_b_width: 0,
                    welds: {}

                },
                featuresIn = []

                const pairs = data.feature_pairs || []
                const welds = data.welds || []

                let weldsTemp = {}

                welds.forEach(a => {

                    weldsTemp[a.side] = a
                    
                    raw["weld_"+ a.side.toLowerCase() + "_width"] = Number(a.us_weld_dist)
                    
                })

                const sidesAB = ["A", "B"]

                sidesAB.forEach(side => {

                    raw.welds[side] = {}

                    weldsTemp[side] && this.weldsTableColumns.map(col => raw.welds[side][col.key] = weldsTemp[side][col.key])

                })

                
                const features = data.features || []

                features.forEach(feat => {

                    let feature = {
        
                            attributes: {},
                            id: feat.id,
                            feature_id: feat.feature_id,
                            side: feat.side,
                            matched: feat.matched
        
                        }

                    feat.attributes.map(attr => feature.attributes[attr.attribute_name] = attr.attribute_data)
                    feature.isLoss = false

                    if (feature.attributes.feature_category === "metal loss / mill anomaly") {
    
                        feature.size = feature.attributes.width_in * feature.attributes.length_in
                        raw.sizes.push(feature.size)
                        feature.isLoss = true
                        
                    }
        
                    raw.features[feature.id] = feature
        
                })

                raw.sizes.sort((a, b) => b - a)

                for (let id in raw.features) {
        
                    const feat =  raw.features[id]

                    if (!~featuresIn.indexOf(id))
                        
                        if (!feat.matched) {
        
                            featuresIn.push(id)

                            raw.table.push({
                                [feat.side]: feat
                            })
        
                        } else {
        
                            for (let i = 0, ix = pairs.length; i < ix; i +=1) {
        
                                for (let id2 in raw.features) {

                                    const pair = raw.features[id2]

                                    if (!~featuresIn.indexOf(id) && !~featuresIn.indexOf(id2))

                                        if (feat.side === "A" && feat.id === pairs[i].feature_a &&
                                            pair.side === "B" && pair.id === pairs[i].feature_b) {
                                        
                                            featuresIn.push(id)
                                            featuresIn.push(id2)

                                            raw.table.push({
                                                A: feat,
                                                B: pair,
                                                match_pair: pairs[i].id
                                            })
            
                                        } else if (feat.side === "B" && feat.id === pairs[i].feature_b &&
                                                    pair.side === "A" && pair.id === pairs[i].feature_a) {
                                            
                                            featuresIn.push(id)
                                            featuresIn.push(id2)

                                            raw.table.push({
                                                A: pair,
                                                B: feat,
                                                match_pair: pairs[i].id
                                            })
            
                                        }
        
                                }
        
                            }
        
                        }
        
                }


                this.rawData = raw
                
                this.setState({

                    welds: raw.welds,
                    manually_checked: raw.manually_checked,
                    max_weld_width: Math.max(raw["weld_a_width"], raw["weld_b_width"]),
                    section_id: raw.section_id

                })

                this.graphPipeSection()

            }
        
        })

    }


    sectionGo = (dir, chk, filter) => {

        this.cancelMatch()

        const ps = this.pipe_sections.data
        const ix = ps.length
        const p = this.pipe_sections.index
        const test = p => (((chk && p.manually_checked) || !chk) &&
                        ((filter && p.feature_count) || !filter))

        let idx = -1

        if (!~dir) {

            for (let i = p - 1; i > -1; i -= 1)

                if (test(ps[i])) {

                    idx = ps[i].id
                    this.pipe_sections.index = i
                    i = -1

                }

        } else {

            for (let i = p + 1; i < ix; i += 1) {

                if (test(ps[i])) {

                    idx = ps[i].id
                    this.pipe_sections.index = i
                    i = ix

                }}
            
        }

        if (~idx) {

            this.pipe_sections.id = idx
            this.setState({sectionIndex:this.pipe_sections.index + 1})
            this.loadPipeSection()

        }

        this.navStatus(filter)

    }

    
    setMatchFilter = (matched, unmatched) => {

        this.filter = {
            matched: matched,
            unmatched: unmatched
        }

        this.graphPipeSection()

    }

    weldsTableColumns = [
        {
            key: "weld_id",
            name: "Weld ID"
        },
        {
            key: "us_weld_dist",
            name: "Weld ID"
        },
        {
            key: "joint_length",
            name: "Distance"
        },
        {
            key: "comments",
            name: "Comment"
        }
    ]

    render = () => (

        <>
            <Modal
                show={this.state.confirm_on}
                onHide={() => {
                    this.setState({confirm_on: false})
                    this.cancelMatch()
                    this.graphPipeSection()
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Feature Match</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-grid-adj">
                    <BootTable bordered hover>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Side A</th>
                                <th>Side B</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => this.gridColumns.map(col => (
                                <tr key={"conf_" + col.key}>
                                    <td>
                                        {col.name}
                                    </td>
                                    <td>
                                        {this.first_match ? col.type ? this.state.featuresPlot[this.first_match].attributes[col.key] : this.state.featuresPlot[this.first_match][col.key] : null}
                                    </td>
                                    <td>
                                        {this.second_match ? col.type ? this.state.featuresPlot[this.second_match].attributes[col.key] : this.state.featuresPlot[this.second_match][col.key] : null}
                                    </td>
                                </tr>
                            )))()}
                        </tbody>
                    </BootTable>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            this.setState({confirm_on: false})
                            this.cancelMatch()
                            this.graphPipeSection()
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {

                            const feature_a = this.rawData.features[this.first_match].side === "A" ? this.first_match : this.second_match
                            const feature_b = this.rawData.features[this.second_match].side === "B" ? this.second_match : this.first_match   

                            const data = [{

                                feature_a: feature_a,
                                feature_b: feature_b,
                                run_match: this.run_match,
                                pipe_section: this.pipe_sections.id

                            }]

                            this.cancelMatch()
                            this.setState({confirm_on: false})

                            this.apiClient.callAPI({

                                method: "post",
                                endpoint: "feature_pair",
                                data: data,
                                callback: () => {
                                    
                                    this.loadPipeSection()

                                }

                            })

                        }}>
                        Save Match
                    </Button>   
                </Modal.Footer>
            </Modal>

            <Ctrl
                manually_checked={this.state.manually_checked}
                manualCheck={() => {
                    const raw = this.rawData
                    const data = [{
                        id: raw.id,
                        section_id: raw.section_id,
                        run_match: raw.run_match,
                        manually_checked: !this.state.manually_checked
                    }]
                    data[0].id && this.apiClient.callAPI({
                        method: "put",
                        endpoint: "pipe_section",
                        id: raw.id,
                        data: JSON.stringify(data),
                        callback: data => {
                            this.setState({manually_checked: data.manually_checked}, ()=>this.setState({...this.state}))
                            this.pipe_sections.data[this.pipe_sections.index].manually_checked = data.manually_checked
                        }
                    })
                }}
                nav_status={this.state.nav_status}
                run_match={String(this.run_match)}
                run_name={this.state.run_name}
                section_id={this.state.section_id}
                sectionIndex={this.state.sectionIndex}
                sectionTotal={this.state.sectionTotal}
                sectionGo={this.sectionGo}
                setMatchFilter={this.setMatchFilter}
                weldGo={id => {
                    this.pipe_sections.id = id
                    this.loadPipeSection()
                }}
                lossLimit={lim => {
                    this.lossLimit = lim
                    this.graphPipeSection()
                }}
            />
            <WeldsTable
                section_id={this.state.section_id || ""}
                welds={this.state.welds} 
                columns={this.weldsTableColumns}/>
            <Axes
                weldWidth={this.state.max_weld_width}
                features={this.state.featuresPlot}
                clickFeature={this.clickFeature}
                hoverFeature={this.hoverOnGraph}
                cancelDrag={() => {

                    if (!this.second_match) {

                        this.cancelMatch()
                        this.graphPipeSection()
                        
                    }

                    this.first_match = 0

                }}
                keyLock={this.state.keyLock}
            />
            <div
                id="grid_container"
                style={{
                    marginLeft: 10,
                    marginRight: 10
                }}
            >
                <CustomGrid
                    key="data_grid"
                    rows={this.state.pipe_section_table}
                    clickFeature={id => this.state.keyLock && this.clickFeature(id)}
                    hoverFeature={this.hoverOnTable}
                    gridColumns={this.gridColumns}
                    unlink={id => window.confirm("Confirm unlinking the feature?") && this.apiClient.callAPI({
                        method: "delete",
                        endpoint:"feature_pair",
                        id: id,
                        callback: () => this.loadPipeSection()})}
                    width={this.state.table_width}
                    keyLock={this.state.keyLock}
                />
            </div>
        </>
        
    )


}
