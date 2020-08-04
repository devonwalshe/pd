import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Toast } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import CustomGrid from './CustomGrid'
import Feature from './Feature.js'
import fontawesome from '@fortawesome/fontawesome'
import { faCrosshairs, faFilter, faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import Toggle from 'react-bootstrap-toggle'
import DataAdapter from './DataAdapter'
import Modal from 'react-modal';
 
Modal.setAppElement('#root')        
fontawesome.library.add(faCrosshairs, faFilter, faSpinner, faSearchPlus, faSearchMinus);

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            features_filter: [],
            match_on: false,
            confirm_on: false,
            modal_info: [],
            filter: {
                matched:true,
                unmatched: true
            },
            is_loading: false,
            rest_error: false,
            pipe_section_graph: [],
            pipe_section_table: [],
            pipe_section_select: [],
            run_matches: [],
            table_width: 0

        }

        this.dataAdapter = new DataAdapter({
            proxyURL: props.proxyURL,
            restURL: props.restURL,
            isLoading: this.isLoading,
            restError: this.restError
        })

        this.pipe_section_instance = 0
        this.pipe_section_graph_width = 0
        this.pipe_section_raw = {}
        this.run_match_instance = 0
        this.first_match = 0
        this.second_match = 0

    }

    isLoading = l => this.setState({is_loading: l})
    restError = () => this.setState({rest_error: true})

    componentDidMount() {

        this.getGraphWidth()
        this.setPipeSections()
        this.dataAdapter.get('run_matches', null, (data) => {

            this.setState({run_matches: data})

        })

        window.addEventListener('resize', () => this.getGraphWidth())
    
    }

    clickFeature = id => {

        id = Number(id)

        if (!this.state.match_on)

            return

        if (this.first_match) {

            document.getElementById(id).style.backgroundColor = 'white'
            this.second_match = id

            this.setState({
                match_on: false,
                confirm_on: true
            })

        } else {

            document.getElementById(id).style.backgroundColor = 'white'
            this.first_match = id
            this.graphPipeSection()

        }

    }


    getGraphWidth = () => {

        this.pipe_section_graph_width = parseFloat(document.getElementById('pipe_graph_container').offsetWidth) - 20

        this.setState({table_width:this.pipe_section_graph_width+50})
        this.graphPipeSection()
        
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
        const graph_width = this.pipe_section_graph_width
        const max_width = Math.max(this.pipe_section_raw['weld_a_width'], this.pipe_section_raw['weld_b_width'])
        
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
                features.push(<Feature key={'feature_' + feature.id} feature={feature} onClick={this.clickFeature}/>)

            }
        }
        this.setState({pipe_section_graph: features})

    }

    
    setMatchFilter = e => {

        const val = e.target.value
        const filter = {
            matched: val === 'matched' ? !this.state.filter.matched : this.state.filter.matched,
            unmatched: val === 'unmatched' ? !this.state.filter.unmatched : this.state.filter.unmatched
        }

        this.setState({filter: filter}, this.graphPipeSection)

    }




    loadPipeSection = () => {
        
        this.dataAdapter.get('pipe_section', this.pipe_section_instance, data => {
        
            this.pipe_section_raw = data
            this.setState({pipe_section_table: data.table})
            this.graphPipeSection()
        
        })

    }


    render() {

        return (

            <>
                <div style={{backgroundColor:'#eee', display:'inline-block', padding:10, width:'100%'}}>
                    <div style={{alignItems:'baseline',display:'flex',float:'left'}}>
                        <Form.Label style={{marginRight:'10px'}}>Run:</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={e =>{
                                this.first_match = 0
                                this.second_match = 0
                                this.setState({match_on: false})
                                this.run_match_instance = Number(e.currentTarget.options[e.currentTarget.selectedIndex].value)
                                this.dataAdapter.get('pipe_sections', null, this.setPipeSections)
                            }}
                            style={{width:'200px'}}
                        >
                            <option>Run Matches...</option>
                            {this.state.run_matches}
                        </Form.Control>
                        <Form.Label style={{marginLeft:'20px',marginRight:'10px'}}>Pipe:</Form.Label>

                        {this.state.pipe_section_select}

                    </div>
                    {this.state.is_loading && (<div style={{float:'right'}}>
                        <i className="fa fa-spinner fa-spin" />
                    </div>)}
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
                            <i className="fa fa-crosshairs"></i>
                        </div>
                        <Toggle
                            active={this.state.match_on}
                            id='match_toggle'
                            on='ON'
                            off='OFF'
                            onstyle='primary'
                            offstyle='default'
                            width={68}
                            height={30}
                            onClick={() => {

                                if (this.first_match) {

                                    document.getElementById(this.first_match).style.backgroundColor = 'transparent'
                                    this.first_match = 0
                                    this.second_match = 0
                                    this.graphPipeSection()

                                } else {

                                    this.first_match = 0
                                    this.second_match = 0

                                }
                                
                                this.setState({match_on: !this.state.match_on})

                            }}
                        />
                        <div style={{display: this.state.confirm_on ? 'block' : 'none'}}>
                                

                            <Button
                                variant="primary"
                                onClick={() => {

                                    
                                    const data = [{

                                        feature_a: this.first_match,
                                        feature_b: this.second_match,
                                        run_match: this.run_match_instance,
                                        pipe_section: this.pipe_section_instance

                                    }]

                                    document.getElementById(this.first_match).style.backgroundColor = 'transparent'
                                    document.getElementById(this.second_match).style.backgroundColor = 'transparent'
                                    
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
                                    document.getElementById(this.first_match).style.backgroundColor = 'transparent'
                                    document.getElementById(this.second_match).style.backgroundColor = 'transparent'
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
                <div className="graph">
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
                    <div>
                        <div>
                            <div>360</div>
                            <div>0</div>
                        </div>
                        <div id="pipe_graph_container">
                            <div></div>
                            {this.state.pipe_section_graph}
                        </div>
                    </div>
                </div>
                <CustomGrid
                    key="data_grid"
                    rows={this.state.pipe_section_table}
                    clickFeature={this.clickFeature}
                    width={this.state.table_width}
                />
                

            </>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
/**<div style={{padding:10,maxWidth:this.state.table_width?this.state.table_width+"px":"auto"}}>
                    <ReactDataGrid
                        maxWidth={this.state.table_width?this.state.table_width+"px":"auto"}
                        columns={[
                            { 
                                key: "id_A",
                                name: "id_A",
                                editable: false,
                                sortable: false,
                                formatter: this.getGridColumn
                            },
                            {
                                key: "feature_A",
                                name: "feature_A",
                                editable: false,
                                sortable: false,
                                formatter: this.getGridColumn
                            },
                            {
                                width:17,
                                formatter:()=>(<div style={{backgroundColor:'lightgray', padding:4}}>&nbsp;</div>)
                            },
                            { 
                                key: "id_B",
                                name: "id_B",
                                editable: false,
                                sortable: false,
                                formatter: this.getGridColumn
                            },
                            {
                                key: "feature_B",
                                name: "feature_B",
                                editable: false,
                                sortable: false,
                                formatter: this.getGridColumn
                            }
                        ]}
                        rowGetter={i => this.state.pipe_section_table[i]}
                        rowsCount={this.state.pipe_section_table.length}
                        onGridRowsUpdated={this.onGridRowsUpdated}
                        enableCellSelect={true}
                    />
                </div>
            
 */