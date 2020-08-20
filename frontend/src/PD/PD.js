import React, { Component } from 'react'
import { Button, Form, Toast } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import CustomGrid from './CustomGrid'
import Feature from './Feature.js'
import fontawesome from '@fortawesome/fontawesome'
import { faLink, faFilter, faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import Toggle from 'react-bootstrap-toggle'
import DataAdapter from './DataAdapter'
import Modal from 'react-modal';
import Axes from './Axes'

Modal.setAppElement('#root')        
fontawesome.library.add(faLink, faFilter, faSpinner, faSearchPlus, faSearchMinus);

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            features_filter: true,
            match_on: false,
            confirm_on: false,
            hover_graph: 0,
            hover_table: 0,
            filter: {
                matched:true,
                unmatched: true
            },
            is_loading: false,
            rest_error: false,
            pipe_section_current: '',
            pipe_section_graph: [],
            pipe_section_table: [],
            pipe_section_select: [],
            run_matches: [],
            run_match_instance: 1,
            screen_width: 0,
            welds: [],
            manually_checked: false,
            weld_side_a: true,
            max_weld_width: 0

        }

        this.dataAdapter = new DataAdapter({
            restError: () => this.setState({rest_error: true})
        })

        this.pipe_section_index = 0
        this.pipe_sections = []
        this.pipe_section_instance = 0
        this.pipe_section_raw = {}
        this.first_match = 0
        this.second_match = 0
        this.y_offset = 90
        

    }

    componentDidMount() {

        this.getGraphWidth()
        this.setPipeSections()
        
        this.dataAdapter.get('run_match', '/1/pipe_sections', (data) => {

            this.pipe_sections = data
            this.pipe_section_index = 0
            this.sectionLoad()
            

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

            this.hltDom(id, 'white')
            this.second_match = id

            this.setState({
                match_on: false,
                confirm_on: true
            })

        } else {

            this.hltDom(id, 'white')
            this.first_match = id
            this.graphPipeSection()

        }

    }


    getGraphWidth = () => {

        //const doc = document.getElementById('pipe_graph_container')

        //if (!doc)

          //  return
console.log(window.innerWidth)
        

        this.setState({screen_width: parseFloat(window.innerWidth)})
        this.graphPipeSection()
        
    }


    hltDom = (id, color) => {

        const doc = document.getElementById(id)
        doc && (doc.style.backgroundColor = color)

    }

    sectionGo = (dir, chk) => {

        const ps = this.pipe_sections
        const ix = ps.length
        const p = this.pipe_section_index
        const test = p => (((chk && p.manually_checked) || (!chk && !p.manually_checked)) &&
                        ((this.state.features_filter && p.feature_count) || (!this.state.features_filter && !p.feature_count)))

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

    sectionLoad = () => {

        this.pipe_section_instance = this.pipe_sections[this.pipe_section_index].id
        this.loadPipeSection()

    }

    setPipeSections = data => this.setState({pipe_section_select: <Typeahead

        id="basic-typeahead-single"
        onChange={e => {

            this.first_match = 0
            this.second_match = 0
            this.setState({match_on: false})

            if (!e || !e[0] || !e[0].key)

                return
            
            this.pipe_section_instance = Number(e[0].key)
    
            this.loadPipeSection()

        }}
        options={data || []}
        placeholder="Pipe Section..." />

    })


    graphPipeSection = () => {

        const data = this.pipe_section_raw.features
        const graph_width = this.state.screen_width - this.y_offset
        const max_width = this.state.max_weld_width

        let features = []

        for (let f in data) {
 
            if (((this.state.filter.matched && data[f].matched) || (this.state.filter.unmatched && !data[f].matched)) &&
                (!this.first_match || (this.first_match === Number(f) || this.pipe_section_raw.features[this.first_match].side !== data[f].side))) {

                let feature = {...data[f]}
                const top = Number(data[f].attributes.orientation_deg)
                const h = Number(data[f].attributes.width_in)
                const w = Number(data[f].attributes.length_in)

                if (!isNaN(h) && !isNaN(w)) {

                    feature.width = graph_width / max_width * w / 12
                    feature.height = graph_width / max_width * h / 12

                }
            
                feature.top = 360 - (!isNaN(top) ? top : 360)
                feature.left = graph_width / max_width * Number(data[f].attributes.us_weld_dist_wc_ft)
                features.push(<Feature
                    key={'feature_' + feature.id}
                    feature={feature}
                    onClick={this.clickFeature}
                    onHover={this.hoverOnGraph}
                />)

            }
        }
        this.setState({pipe_section_graph: features, pipe_section_current: this.pipe_section_raw.section_id})

    }

    
    setMatchFilter = e => {

        const val = e.target.value
        const filter = {
            matched: val === 'matched' ? !this.state.filter.matched : this.state.filter.matched,
            unmatched: val === 'unmatched' ? !this.state.filter.unmatched : this.state.filter.unmatched
        }

        this.setState({filter: filter}, this.graphPipeSection)

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
        
            this.hltDom(this.state.hover_graph, 'transparent')

        }

        this.setState({hover_graph: id})
        this.hltDom(id, 'white')

    }


    loadPipeSection = () => {
        
        this.dataAdapter.get('pipe_section', this.pipe_section_instance, data => {
        
            this.pipe_section_raw = data
            
            this.setState({
                pipe_section_table: data.table,
                welds: data.welds,
                manually_checked: data.manually_checked,
                max_weld_width: Math.max(data['weld_a_width'], data['weld_b_width'])
            })
            this.graphPipeSection()
        
        })

    }

    unlink = id => window.confirm('Confirm unlinking the feature?') && this.dataAdapter.delete('feature_pair', id, () => this.loadPipeSection())


    render() {

        return (

            <>
                <div style={{position:"absolute"}}>
                        <Toast
                            onClose={() => this.setState({rest_error: false})}
                            show={this.state.rest_error}
                            animation={false}
                        >
                            <Toast.Header>
                                <strong className="mr-auto">Error</strong>
                                    <small></small>
                                </Toast.Header>
                            <Toast.Body>Invalid response from server</Toast.Body>
                        </Toast>
                </div>
                <div style={{backgroundColor:'#eee', display:'inline-block', padding:10, width:'100%', whiteSpace:'nowrap'}}>
                    <div style={{alignItems:'center',display:'flex',float:'left'}}>
                        <Form.Label style={{marginRight:'10px'}}>Run ID:</Form.Label>
                        <Form.Label style={{fontWeight: 'bold', marginRight:'10px'}}>{this.state.run_match_instance}</Form.Label>
                        <Button variant="outline-primary" onClick={() => this.sectionGo(-1,true)} >&lt;&lt;</Button>
                        <Button variant="outline-primary" onClick={() => this.sectionGo(-1,false)}>&lt;</Button>
                        <div className="feature_filter">
                            <div>Features</div>
                            <div>
                                <Toggle
                                    active={this.state.features_filter}
                                    id='match_toggle'
                                    on='YES'
                                    off='NO'
                                    onstyle='default'
                                    offstyle='default'
                                    width={60}
                                    height={20}
                                    onClick={() => {

                                        this.setState({features_filter: !this.state.features_filter})

                                    }}
                                />
                            </div>
                        </div>
                        <Button variant="outline-primary" onClick={() => this.sectionGo(1,false)}>&gt;</Button>
                        <Button variant="outline-primary" onClick={() => this.sectionGo(1,true)}>&gt;&gt;</Button>

                        Section: <b>{this.state.pipe_section_current}</b>
                        &nbsp;
                        Jump to Weld:
                        <Form.Control
                            type="text"
                            onKeyPress={e => {
                                
                                if (e.key === 'Enter') {

                                    const param = escape('?weld_id=' + e.target.value + '&run_match=1')

                                    this.dataAdapter.get('welds', param, data => {

                                        
                                        data.forEach(weld => {

                                            if ((weld.side === 'A' && this.state.weld_side_a) ||
                                                (weld.side === 'B' && !this.state.weld_side_a)) {

                                                    this.pipe_section_instance = weld.pipe_section_id
                                                    this.loadPipeSection()
                                                    

                                                }

                                        })

                                    })

                                }
                            }}
                            style={{width:'100px'}}></Form.Control>
                        <Toggle
                            active={this.state.weld_side_a}
                            id='match_toggle'
                            on='A'
                            off='B'
                            onstyle='side_a'
                            offstyle='side_b'
                            width={50}
                            height={38}
                            onClick={() => {
                                this.setState({weld_side_a: !this.state.weld_side_a})
                            }}
                        />

                    </div>
                    <div style={{alignItems:'baseline',float:'right'}}>
                        <Toggle
                            active={this.state.manually_checked}
                            on='Complete'
                            off='Uncomplete'
                            onstyle='success'
                            offstyle='danger'
                            width={120}
                            height={38}
                            onClick={() => {

                                const r = this.pipe_section_raw
                                const data = [{
                                    id: r.id,
                                    section_id: r.section_id,
                                    run_match: r.run_match,
                                    manually_checked: !this.state.manually_checked
                                }]
                                this.dataAdapter.put('pipe_section', r.id, data, data => {
                                    this.setState({manually_checked: data.manually_checked})
                                })

                            }}
                        />
                    </div>
                </div>
                <div style={{backgroundColor:'#fff', display:'inline-block', padding:10, width:'100%'}}>
                    <div style={{alignItems:'center', display:"flex", float:"left"}}>
                        <div style={{backgroundColor:'#DDD',marginRight:'10px',  paddingBottom:5, paddingLeft: 10, paddingRight: 10, paddingTop: 5}} title="Feature Filter">
                            <i className="fa fa-filter"></i>
                        </div>
                        <Form.Check type="checkbox" value="matched" label="Matched" onChange={this.setMatchFilter} checked={this.state.filter.matched} />
                        <div style={{width:'15px'}}></div>
                        <Form.Check type="checkbox" value="unmatched" label="Unmatched" onChange={this.setMatchFilter} checked={this.state.filter.unmatched} />
                        <div style={{borderRight:'1px solid #444',marginLeft: 20, marginRight: 25, height: 30}}></div>
                        <div style={{backgroundColor:'#DDD',marginRight:'10px', paddingBottom:5, paddingLeft: 10, paddingRight: 10, paddingTop: 5}} title="Feature Matching ON/OFF">
                            <i className="fa fa-link"></i>
                        </div>
                        <Toggle
                            active={this.state.match_on}
                            on='ON'
                            off='OFF'
                            onstyle='primary'
                            offstyle='default'
                            width={68}
                            height={30}
                            onClick={() => {

                                if (this.first_match) {


                                    this.hltDom(this.first_match, 'transparent')
                                    this.hltDom(this.second_match, 'transparent')
                                    this.first_match = 0
                                    this.second_match = 0
                                    this.graphPipeSection()

                                }
                                
                                this.setState({match_on: !this.state.match_on})

                            }}
                        />
                        <div style={{display: this.state.confirm_on ? 'block' : 'none'}}>
                            <Button
                                variant="primary"
                                onClick={() => {

                                    const feature_a = this.pipe_section_raw.features[this.first_match] === 'A' ? this.first_match : this.second_match
                                    const feature_b = this.pipe_section_raw.features[this.second_match] === 'B' ? this.second_match : this.first_match

                                    
                                    const data = [{

                                        feature_a: feature_a,
                                        feature_b: feature_b,
                                        run_match: this.state.run_match_instance,
                                        pipe_section: this.pipe_section_instance

                                    }]

                                    this.hltDom(this.first_match, 'transparent')
                                    this.hltDom(this.second_match, 'transparent')

                                    this.first_match = 0
                                    this.second_match = 0
                                    this.setState({

                                        match_on: false,
                                        confirm_on: false

                                    })

                                    this.dataAdapter.post('feature_pair', data, data => {
                                            
                                        this.loadPipeSection()

                                    })

                                }}>Save</Button>{' '}
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    this.hltDom(this.first_match, 'transparent')
                                    this.hltDom(this.second_match, 'transparent')
                                    this.first_match = 0
                                    this.second_match = 0
                                    this.setState({
                                        match_on: false,
                                        confirm_on: false
                                    }, this.graphPipeSection)

                                }}>Cancel</Button>
                        </div>
                    </div>
                    <div style={{display:'flex', direction:'row', alignItems:"center", float:"right"}}>
                        <i className="fa fa-search-minus" style={{marginRight:'10px'}}></i>
                        <Form.Control type="text" placeholder="1" style={{width:'50px'}} />
                        <i className="fa fa-search-plus" style={{marginLeft:'10px'}}></i>
                    </div>
                </div>
                <div className="welds_table">{this.state.welds}</div>
                <div className="graph">
                    <Axes
                        graphWidth={this.state.screen_width}
                        weldWidth={this.state.max_weld_width}
                        yOffset={this.y_offset}
                    />
                    <div id="pipe_graph_container">
                        {this.state.pipe_section_graph}
                    </div>
                </div>
                <CustomGrid
                    key="data_grid"
                    rows={this.state.pipe_section_table}
                    clickFeature={this.clickFeature}
                    hoverFeature={this.hoverOnTable}
                    unlink={this.unlink}
                    width={this.state.screen_width - 40}
                />
                

            </>
            
        )

    }

}
