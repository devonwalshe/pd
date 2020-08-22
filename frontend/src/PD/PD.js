import React, { Component } from 'react'
import CustomGrid from './CustomGrid'
import Feature from './Feature.js'
import DataAdapter from './DataAdapter'
import Axes from './Axes'
import WeldsTable from './WeldsTable'
import Ctrl from './Ctrl'


export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            id: 0,
            match_on: false,
            confirm_on: false,
            hover_graph: 0,
            hover_table: 0,
            section_id: '',
            pipe_section_graph: [],
            pipe_section_table: [],
            screen_width: 0,
            welds: {},
            manually_checked: false,
            max_weld_width: 0

        }

        this.dataAdapter = new DataAdapter()

        this.filter = {
            matched:true,
            unmatched: true
        }
        this.pipe_section_index = 0
        this.pipe_sections = []
        this.pipe_section_instance = 0
        this.pipe_section_raw = {}
        this.run_match = 1
        this.first_match = 0
        this.second_match = 0
        this.offset = {
            margin: 30,
            x: 30,
            y: 55
        }
        

    }

    componentDidMount() {

        this.getGraphWidth()
        
        this.dataAdapter.get('run_match', '/' + this.run_match + '/pipe_sections', (data) => {

            this.pipe_sections = data
            this.pipe_section_index = 0
            this.pipe_section_instance = this.pipe_sections[this.pipe_section_index].id
            this.loadPipeSection()
            

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

            this.highligtDom(id, 'white')
            this.second_match = id

            this.setState({
                match_on: false,
                confirm_on: true
            })

        } else {

            this.highligtDom(id, 'white')
            this.first_match = id
            this.graphPipeSection()

        }

    }


    getGraphWidth = () => this.setState({screen_width: parseFloat(window.innerWidth)}, this.graphPipeSection)


    highligtDom = (id, color) => {

        const doc = document.getElementById(id)
        doc && (doc.style.backgroundColor = color)

    }

    sectionGo = (dir, chk, filter) => {

        const ps = this.pipe_sections
        const ix = ps.length
        const p = this.pipe_section_index
        const test = p => (((chk && p.manually_checked) || (!chk && !p.manually_checked)) &&
                        ((filter && p.feature_count) || !filter))

        let idx = -1

        if (!~dir) {

            for (let i = p - 1; i > -1; i -= 1)

                if (test(ps[i])) {

                    idx = ps[i].id
                    this.pipe_section_index = i
                    i = -1

                }

        } else {

            for (let i = p + 1; i < ix; i += 1) 

                if (test(ps[i])) {

                    idx = ps[i].id
                    this.pipe_section_index = i
                    i = ix

                }
            
        }

        if (~idx) {

            this.pipe_section_instance = idx
            this.loadPipeSection()

        }


    }


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

                    feature.width = graph_width / max_width * w / 12
                    feature.height = graph_width / max_width * h / 12

                }
            
                feature.top = 360 - (!isNaN(top) ? top : 360) + this.offset.x
                feature.left = graph_width / max_width * Number(data[f].attributes.us_weld_dist_wc_ft) + this.offset.y
                features.push(<Feature
                    key={'feature_' + feature.id}
                    feature={feature}
                    onClick={this.clickFeature}
                    onHover={this.hoverOnGraph}
                />)

            }
        }
        this.setState({pipe_section_graph: features})

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
        
            this.highligtDom(this.state.hover_graph, 'transparent')

        }

        this.setState({hover_graph: id})
        this.highligtDom(id, 'white')

    }


    loadPipeSection = () => {
        
        this.dataAdapter.get('pipe_section', this.pipe_section_instance, data => {
        
            this.pipe_section_raw = data
            
            this.setState({
                id: data.id,
                pipe_section_table: data.table,
                welds: data.welds,
                manually_checked: data.manually_checked,
                max_weld_width: Math.max(data['weld_a_width'], data['weld_b_width']),
                section_id: data.section_id
            })
            this.graphPipeSection()
        
        })

    }

    render() {

        return (

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
                        data[0].id && this.dataAdapter.put('pipe_section', r.id, data, data => {

                            this.setState({manually_checked: data.manually_checked}, ()=>this.setState({...this.state}))
                            this.pipe_sections[this.pipe_section_index].manually_checked = data.manually_checked

                        })
                    }}
                    match_on={this.state.match_on}
                    onCancel={() => {
                        this.highligtDom(this.first_match, 'transparent')
                        this.highligtDom(this.second_match, 'transparent')
                        this.first_match = 0
                        this.second_match = 0
                        this.setState({
                            match_on  : false,
                            confirm_on: false
                        }, this.graphPipeSection)

                    }}
                    onConfirm={() => {
                        const feature_a = this.pipe_section_raw.features[this.first_match] === 'A' ? this.first_match : this.second_match
                        const feature_b = this.pipe_section_raw.features[this.second_match] === 'B' ? this.second_match : this.first_match   
                        const data = [{
                            feature_a: feature_a,
                            feature_b: feature_b,
                            run_match: this.run_match,
                            pipe_section: this.pipe_section_instance
                        }]

                        this.highligtDom(this.first_match, 'transparent')
                        this.highligtDom(this.second_match, 'transparent')
                        this.first_match = 0
                        this.second_match = 0
                        this.setState({
                            match_on: false,
                            confirm_on: false
                        })
                        this.dataAdapter.post('feature_pair', data, () => this.loadPipeSection())

                    }}
                    onMatch={() => {
                        if (this.first_match) {
                            this.highligtDom(this.first_match, 'transparent')
                            this.highligtDom(this.second_match, 'transparent')
                            this.first_match = 0
                            this.second_match = 0
                            this.graphPipeSection()
                        }
                        this.setState({match_on: !this.state.match_on}, ()=>this.setState({...this.state}))
                    }}
                    run_match={String(this.run_match)}
                    section_id={this.state.section_id}
                    sectionGo={this.sectionGo}
                    setMatchFilter={this.setMatchFilter}
                    weldGo={id => {

                        this.pipe_section_instance = id
                        this.loadPipeSection()

                    }}
                    

                />
                <WeldsTable section_id={this.state.section_id || ''} welds={this.state.welds} />
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
                    unlink={id => window.confirm('Confirm unlinking the feature?') && this.dataAdapter.delete('feature_pair', id, () => this.loadPipeSection())}
                    width={this.state.screen_width - 40}
                />
            </>
            
        )

    }

}
