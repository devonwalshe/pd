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
            section_id: '',
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

        this.pipe_section_raw = {}
        this.run_match = window.location.href.split('/').slice(-1)[0]
        this.first_match = 0
        this.second_match = 0
        this.offset = {
            margin: 30,
            x: 30,
            y: 55
        }
        this.bgHi = 'yellow'
        

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

            if (this.pipe_section_raw.features[this.first_match].side === this.pipe_section_raw.features[id].side)

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

        const data = this.pipe_section_raw.features
        const graph_width = this.state.screen_width - this.offset.y - this.offset.margin
        const max_width = this.state.max_weld_width

        let features = []

        for (let f in data) {
 
            if (((this.filter.matched && data[f].matched) || (this.filter.unmatched && !data[f].matched)) &&
                (!this.first_match || (this.first_match === Number(f) || this.pipe_section_raw.features[this.first_match].side !== data[f].side))) {

                let feature = {...data[f]}
                const top = Number(data[f].attributes.orientation_deg)
                const h = Number(data[f].attributes.width_in)
                const w = Number(data[f].attributes.length_in)

                if (!isNaN(h) && !isNaN(w)) {

                    const minSize = 0.5
                    const noDimFeatureSize = 2

                    feature.width = w > minSize ? graph_width / max_width * w / 12 : noDimFeatureSize
                    feature.height = h > minSize ? graph_width / max_width * h / 12 : noDimFeatureSize

                }
            
                feature.top = 360 - (!isNaN(top) ? top : 360) + this.offset.x
                feature.left = graph_width / max_width * Number(data[f].attributes.us_weld_dist_wc_ft) + this.offset.y
                
                features.push(

                    <Feature
                        key={'feature_' + feature.id}
                        feature={feature}
                        onClick={this.clickFeature}
                        onHover={this.hoverOnGraph}
                        matchMode={this.first_match && feature.id !== this.first_match? true : false}
                    />

                )

            }

        }

        this.setState({pipe_section_graph: features})

    }


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
            
                const getTableRow = (a, b, f) => {

                    const side = (obj, side) => {

                        const att = (obj && obj.attributes) || null

                        const cols = [
                            {
                                name: 'feature',
                                type: 'str'
                            },
                            {
                                name: 'feature_category',
                                type: 'str'
                            },
                            {
                                name: 'orientation_deg',
                                type: 'num'
                            },
                            {
                                name: 'us_weld_dist_wc_ft',
                                type: 'num'
                            },
                            {
                                name: 'us_weld_dist_coord_m',
                                type: 'num'
                            },
                            {
                                name: 'length_in',
                                type: 'num'
                            },
                            {
                                name: 'width_in',
                                type: 'num'
                            },
                            {
                                name: 'idepth_ind',
                                type: 'num'
                            }
                        ]
                        
                        let out = {

                            ['id_' + side]: (obj && obj.id) || '',
                            ['feature_id_' + side]: (obj && obj.feature_id) || ''

                        }
                        
                        cols.forEach(col => {

                            out[col.name + '_' + side] = (att && ({
                                num: col => (att[col] && Number(att[col]).toFixed(4)) || ' ',
                                str: col => (att[col] && att[col]) || ''
                            })[col.type](col.name)) || ''
                            
                        })

                        return out
                        
                    }

                    return{
            
                        ...side(a, 'A'),
                        _gutter: f ? f : false,
                        ...side(b, 'B'),
            
                    }
            
                }
            
                let pipeSection = {

                    id: data.id,
                    section_id: data.section_id,
                    run_match: data.run_match,
                    run_name: data.name,
                    manually_checked: data.manually_checked,
                    features: {},
                    table: [],
                    weld_a_width: 0,
                    weld_b_width: 0,
                    welds: {}

                },
                temp = [],
                featuresIn = []

                const pipe = data.features || []
                const pairs = data.feature_pairs || []
                const welds = data.welds || []

                pipe.forEach(p => {
        
                    let feature = {
        
                            attributes: {},
                            id: p.id,
                            feature_id: p.feature_id,
                            side: p.side,
                            matched: p.matched
        
                        }
        
                    p.attributes.map(a => feature.attributes[a.attribute_name] = a.attribute_data)
        
                    temp.push(feature)
        
                })
        
                let weldsTemp = {}

                welds.forEach(a => {

                    weldsTemp[a.side] = a
                    
                    pipeSection['weld_'+ a.side.toLowerCase() + '_width'] = Number(a.us_weld_dist)
                    
                })

                const sidesAB = ['A', 'B']

                sidesAB.forEach(side => {

                    pipeSection.welds[side] = {}

                        weldsTemp[side] && this.weldsTableColumns.map(f => pipeSection.welds[side][f] = weldsTemp[side][f])

                })



                for (let i = 0, ix = temp.length; i < ix; i +=1) {
                    
                    pipeSection.features[temp[i].id] = temp[i]
        
                    if (!~featuresIn.indexOf(temp[i].id))
                        
                        if (!temp[i].matched) {
        
                            featuresIn.push(temp[i].id)
                            pipeSection.table.push(temp[i].side === 'A' ? getTableRow(temp[i], null) : getTableRow(null, temp[i]))
        
                        } else {
        
                            for (let j = 0, jx = pairs.length; j < jx; j +=1) {
        
                                for (let k = 0, kx = temp.length; k < kx; k +=1) {

                                    if (!~featuresIn.indexOf(temp[i].id) && !~featuresIn.indexOf(temp[k].id))

                                        if (temp[i].side === 'A' && temp[i].id === pairs[j].feature_a &&
                                            temp[k].side === 'B' && temp[k].id === pairs[j].feature_b) {
                                        
                                            featuresIn.push(temp[i].id)
                                            featuresIn.push(temp[k].id)
                                                
                                            pipeSection.table.push(getTableRow(temp[i], temp[k], pairs[j].id))
            
                                        } else if
                                            (temp[i].side === 'B' && temp[i].id === pairs[j].feature_b &&
                                            temp[k].side === 'A' && temp[k].id === pairs[j].feature_a) {
                                            
                                            featuresIn.push(temp[i].id)
                                            featuresIn.push(temp[k].id)
                                            pipeSection.table.push(getTableRow(temp[k], temp[i], pairs[j].id))
            
                                        }
        
                                }
        
                            }
        
                        }
        
                }

                this.pipe_section_raw = pipeSection
                
                this.setState({
                    id: pipeSection.id,
                    pipe_section_table: pipeSection.table,
                    welds: pipeSection.welds,
                    manually_checked: pipeSection.manually_checked,
                    max_weld_width: Math.max(pipeSection['weld_a_width'], pipeSection['weld_b_width']),
                    section_id: pipeSection.section_id
                })

                this.graphPipeSection()

            }
        
        })

    }


    weldsTableColumns = [
        'side',
        'weld_id',
        'us_weld_dist',
        'joint_length',
        'wall_thickness'
    ]

    render = () => (

        <>
            <Ctrl
                confirm_on={this.state.confirm_on}
                manually_checked={this.state.manually_checked}
                manualCheck={() => {
                    const r = this.pipe_section_raw
                    const data = [{
                        id: r.id,
                        section_id: r.section_id,
                        run_match: r.run_match,
                        manually_checked: !this.state.manually_checked
                    }]

                    data[0].id && this.apiClient.callAPI({
                        method: 'put',
                        endpoint: 'pipe_section',
                        id: r.id,
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
                    this.highlightDom(this.first_match, 'transparent')
                    this.highlightDom(this.second_match, 'transparent')
                    this.first_match = 0
                    this.second_match = 0
                    this.setState({
                        match_on  : false,
                        confirm_on: false
                    }, this.graphPipeSection)
                }}
                onConfirm={() => {
                    const feature_a = this.pipe_section_raw.features[this.first_match].side === 'A' ? this.first_match : this.second_match
                    const feature_b = this.pipe_section_raw.features[this.second_match].side === 'B' ? this.second_match : this.first_match   
                    const data = [{
                        feature_a: feature_a,
                        feature_b: feature_b,
                        run_match: this.run_match,
                        pipe_section: this.pipe_sections.id
                    }]
                    this.highlightDom(this.first_match, 'transparent')
                    this.highlightDom(this.second_match, 'transparent')
                    this.first_match = 0
                    this.second_match = 0
                    this.setState({
                        match_on: false,
                        confirm_on: false
                    })
                    this.apiClient.callAPI({  
                        method: 'post',
                        endpoint: 'feature_pair',
                        data: data,
                        callback: () => this.loadPipeSection()
                    })
                }}
                onMatch={() => {
                    if (this.first_match) {
                        this.highlightDom(this.first_match, 'transparent')
                        this.highlightDom(this.second_match, 'transparent')
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
            />
            <WeldsTable
                section_id={this.state.section_id || ''}
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
                unlink={id => window.confirm('Confirm unlinking the feature?') && this.apiClient.callAPI({
                    method: 'delete',
                    endpoint:'feature_pair',
                    id: id,
                    callback: () => this.loadPipeSection()})}
                width={this.state.screen_width - 40}
            />
        </>
        
    )


}
