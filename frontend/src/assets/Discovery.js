import React, { Component } from 'react'
import CustomGrid from './CustomGrid'
import Feature from './Feature.js'
import APIClient from './APIClient.js'
import Axes from './Axes'
import WeldsTable from './WeldsTable'
import Ctrl from './Ctrl'

export default class Discovery extends Component {

    constructor(props) {

        super(props)

        this.state = {

            id: 0,
            match_on: false,
            confirm_on: false,
            hover_graph: 0,
            hover_table: 0,
            nav_status: '0000',
            run_name: '',
            pipe_section_graph: [],
            pipe_section_table: [],
            screen_width: 0,
            welds: {},
            manually_checked: false,
            max_weld_width: 0,
            sectionIndex: 0,
            sectionTotal: 0

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
        this.run_match = window.location.href.split('/').slice(-1)[0]
        this.first_match = 0
        this.second_match = 0
        this.offset = {
            margin: 30,
            x: 30,
            y: 55
        }
        this.bgHi = 'yellow'
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
            
            endpoint: 'run_match',
            
            data: this.run_match + '/pipe_sections',
            
            callback: data => {

                if (this._isMounted) {

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

            }

        })

        this.apiClient.callAPI({

            endpoint: 'run_match',
            data: this.run_match,
            callback: data => this._isMounted && this.setState({run_name: data.name})

        })

        window.addEventListener('resize', this.getGraphWidth)
        
    }

    clickFeature = id => {

        id = Number(id)

        if (!this.state.match_on)

            return

        if (this.first_match) {

            if (this.rawData.features[this.first_match].side === this.rawData.features[id].side)

                return

            this.highlightDom(id, this.bgHi)
            this.second_match = id

            this.setState({
                match_on: false,
                confirm_on: true
            }, ()=> this.setState({...this.state}))

        } else {

            this.first_match = id
            this.graphPipeSection()

        }

    }


    getGraphWidth = () => this._isMounted && this.setState({screen_width: parseFloat(window.innerWidth)}, this.graphPipeSection)


    graphPipeSection = () => {

        const data = this.rawData.features
        const graph_width = this.state.screen_width - this.offset.y - this.offset.margin
        const max_width = this.state.max_weld_width
        const minSize = 0.5
        const noDimFeatureSize = 2

        let features = []

        for (let f in data) {
 
            if (((this.filter.matched && data[f].matched) || (this.filter.unmatched && !data[f].matched)) &&
                (!this.first_match || (this.first_match === Number(f) || this.rawData.features[this.first_match].side !== data[f].side))) {

                let feature = {...data[f]}

                const h = data[f].width_in
                const w = data[f].length_in

                if (!isNaN(h) && !isNaN(w)) {

                    feature.width = w > minSize ? graph_width / max_width * w / 12 : noDimFeatureSize
                    feature.height = h > minSize ? graph_width / max_width * h / 12 : noDimFeatureSize

                }
            
                feature.left = graph_width / max_width * Number(data[f].attributes.us_weld_dist_wc_ft) + this.offset.y
                
                features.push(feature)

            }

        }

        let allFeatures = []

        if (this.lossLimit && this.lossLimit < this.rawData.sizes.length)

            for (let i = features.length - 1; i > -1; i -= 1) {
                
                if (features[i].size && features[i].size < this.rawData.sizes[this.lossLimit])

                    features.splice(i, 1)

                else

                    allFeatures.push(features[i].id)

            }

        const getTableRow = (a, b, pair) => {

            const side = (obj, side) => {

                const attr = (obj && obj.attributes) || null
                
                let out = {

                    ['id_' + side]: (obj && obj.id) || false,
                    ['feature_id_' + side]: (obj && obj.feature_id) || false

                }
                
                this.gridColumns.filter(col => col.type).forEach(col => {

                    out[col.key + '_' + side] = (attr && ({
                        num: key => (attr[key] && Number(attr[key]).toFixed(4)) || ' ',
                        str: key => attr[key] || ' '
                    })[col.type](col.key)) || false
                    
                })

                return out
                
            }

            return{
    
                ...side(a, 'A'),
                match_pair: a && b ? pair : false,
                ...side(b, 'B'),
    
            }
    
        }

        let table = []

        const tableRaw = this.rawData.table || []
        
        tableRaw.forEach(row => {

            if (!allFeatures.length)

                table.push(getTableRow(row.A, row.B, row.match_pair))

            else {
                
                const a = (~allFeatures.indexOf(row.A.id) && row.A) || null
                const b = (~allFeatures.indexOf(row.B.id) && row.B) || null

                if (a || b)

                    table.push(getTableRow(a, b, row.match_pair))

            }   

        })


        this.setState({
            pipe_section_table: table,
            pipe_section_graph: features.map(feature => (
                <Feature
                    key={'feature_' + feature.id}
                    feature={feature}
                    onClick={this.clickFeature}
                    onHover={this.hoverOnGraph}
                    matchMode={this.first_match && feature.id !== this.first_match? true : false}
                />
            ))
        })

    }


    gridColumns = [
        {
            width:11,
            name: 'ID',
            key:'feature_id',
            show: true
        },
        {
            width: 7,
            name: 'Feature',
            key:'feature',
            show: true,
            type: 'str'
        },
        {
            width: 13,
            name: 'feature_category',
            key:'feature_category',
            show: false,
            type: 'str'
        },
        {
            width: 16,
            name: 'us_weld_dist_wc_ft',
            key: 'us_weld_dist_wc_ft',
            show: true,
            type: 'num'
        },
        {
            width: 18,
            name: 'us_weld_dist_coord_m',
            key:'us_weld_dist_coord_m',
            show: true,
            type: 'num'
        },
        {
            width: 7,
            name: 'Depth',
            key:'depth_in',
            show: true,
            type: 'num'
        },
        {
            width: 8,
            name: 'Length',
            key:'length_in',
            show: true,
            type: 'num'
        },
        {
            width: 7,
            name: 'Width',
            key:'width_in',
            show: true,
            type: 'num'
        },
        {
            width: 13,
            name: 'Orientation',
            key:'orientation_deg',
            show: true,
            type: 'num'
        },
        {
            width: 13,
            name: 'Comments',
            key:'comments',
            show: true,
            type: 'str'
        }
    ]

    
    highlightDom = (id, color) => {

        const doc = document.getElementById(id)

        if (doc && !doc.childNodes.length && color === 'transparent')

            doc.style.backgroundColor = doc.style.borderColor
        
        else if (doc)

            doc.style.backgroundColor = color

    }


    navStatus = filter => {

        const p = this.pipe_sections
        const ln = p.data.length

        let n

        if (!ln)

            n = '0000'

        else if (!p.index)

            n = '0011'

        else if (p.index === (ln - 1))

            n = '1100'

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

            n = nx.join('')

        }

        this.setState({nav_status: n})

    }

    hoverOnGraph = id => {

        const hlt = (id, color) => {

            const docs = document.getElementsByName(id)

            for (let i = 0, ix = docs.length; i < ix; i += 1)

                docs[i].style.backgroundColor = color

        }

        this.state.hover_table && hlt(this.state.hover_table, 'transparent')
        this.setState({hover_table: id})
        this.state.hover_table && hlt(id, 'lightblue')

    }

    hoverOnTable = id => {
        
        if (!id)

            return

        if (this.state.hover_graph && 
            this.first_match !== this.state.hover_graph &&
            this.second_match !== this.state.hover_graph) {
        
            this.highlightDom(this.state.hover_graph, 'transparent')

        }

        this.setState({hover_graph: id})
        this.highlightDom(id, this.bgHi)

    }


    loadPipeSection = () => {
        
        this.apiClient.callAPI({
            
            endpoint: 'pipe_section',
            
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
                    
                    raw['weld_'+ a.side.toLowerCase() + '_width'] = Number(a.us_weld_dist)
                    
                })

                const sidesAB = ['A', 'B']

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

                    const top = Number(feature.attributes.orientation_deg)

                    feature.top = 360 - (!isNaN(top) ? top : 360) + this.offset.x
                    feature.width_in = Number(feature.attributes.width_in) || 0
                    feature.length_in = Number(feature.attributes.length_in) || 0

                    if (feature.attributes.feature_category === 'metal loss / mill anomaly') {
    
                        feature.size = feature.width_in * feature.length_in
                        raw.sizes.push(feature.size)
                        
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

                                        if (feat.side === 'A' && feat.id === pairs[i].feature_a &&
                                            pair.side === 'B' && pair.id === pairs[i].feature_b) {
                                        
                                            featuresIn.push(id)
                                            featuresIn.push(id2)

                                            raw.table.push({
                                                A: feat,
                                                B: pair,
                                                match_pair: pairs[i].id
                                            })
            
                                        } else if (feat.side === 'B' && feat.id === pairs[i].feature_b &&
                                                    pair.side === 'A' && pair.id === pairs[i].feature_a) {
                                            
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
                    id: raw.id,
                    welds: raw.welds,
                    manually_checked: raw.manually_checked,
                    max_weld_width: Math.max(raw['weld_a_width'], raw['weld_b_width']),
                    section_id: raw.section_id
                })

                this.graphPipeSection()

            }
        
        })

    }



    sectionGo = (dir, chk, filter) => {

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
            key: 'weld_id',
            name: 'Weld ID'
        },
        {
            key: 'us_weld_dist',
            name: 'Weld ID'
        },
        {
            key: 'joint_length',
            name: 'Distance'
        },
        {
            key: 'comments',
            name: 'Comment'
        }
    ]

    render = () => (

        <>
            <Ctrl
                confirm_on={this.state.confirm_on}
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
                match_on={this.state.match_on}
                nav_status={this.state.nav_status}
                onCancel={() => {
                    this.highlightDom(this.first_match, "transparent")
                    this.highlightDom(this.second_match, "transparent")
                    this.first_match = 0
                    this.second_match = 0
                    this.setState({
                        match_on  : false,
                        confirm_on: false
                    }, this.graphPipeSection)
                }}
                onConfirm={() => {
                    const feature_a = this.rawData.features[this.first_match].side === "A" ? this.first_match : this.second_match
                    const feature_b = this.rawData.features[this.second_match].side === "B" ? this.second_match : this.first_match   
                    const data = [{
                        feature_a: feature_a,
                        feature_b: feature_b,
                        run_match: this.run_match,
                        pipe_section: this.pipe_sections.id
                    }]
                    this.highlightDom(this.first_match, "transparent")
                    this.highlightDom(this.second_match, "transparent")
                    this.first_match = 0
                    this.second_match = 0
                    this.setState({
                        match_on: false,
                        confirm_on: false
                    })
                    this.apiClient.callAPI({  
                        method: "post",
                        endpoint: "feature_pair",
                        data: data,
                        callback: () => {
                            
                            this.loadPipeSection()
                        
                        }
                    })
                }}
                onMatch={() => {
                    if (this.first_match) {
                        this.highlightDom(this.first_match, "transparent")
                        this.highlightDom(this.second_match, "transparent")
                        this.first_match = 0
                        this.second_match = 0
                        this.graphPipeSection()
                    }
                    this.setState({match_on: !this.state.match_on}, () => this.setState({...this.state}))
                }}
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
            <div className="graph">
                <Axes
                    graphWidth={this.state.screen_width}
                    weldWidth={this.state.max_weld_width}
                    offset={this.offset}
                />
                {this.state.pipe_section_graph}
            </div>
            <CustomGrid
                key="data_grid"
                rows={this.state.pipe_section_table}
                clickFeature={this.clickFeature}
                hoverFeature={this.hoverOnTable}
                gridColumns={this.gridColumns}
                unlink={id => window.confirm("Confirm unlinking the feature?") && this.apiClient.callAPI({
                    method: "delete",
                    endpoint:"feature_pair",
                    id: id,
                    callback: () => this.loadPipeSection()})}
                width={this.state.screen_width - 40}
            />
        </>
        
    )


}
