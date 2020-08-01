import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Toast } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import ReactDataGrid from 'react-data-grid'
import Feature from './Feature.js'
import fontawesome from '@fortawesome/fontawesome'
import { faCrosshairs, faFilter, faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import Toggle from 'react-bootstrap-toggle'
import DataAdapter from './DataAdapter'

fontawesome.library.add(faCrosshairs, faFilter, faSpinner, faSearchPlus, faSearchMinus);

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            features_filter: [],
            match_on: false,
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
            screen_width: 0

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

    }

    isLoading = l => this.setState({is_loading: l})
    restError = () => this.setState({rest_error: true})

    componentDidMount() {

        this.getGraphWidth()
        this.setPipeSections()
        this.fetchRest('run_matches', null, (data) => {

            this.setState({run_matches: data})

        })

        window.addEventListener('resize', () => this.getGraphWidth())
        
    }

    clickFeature = e => {

        const id = Number(e.currentTarget.id)

        if (this.state.match_on)

            if (this.first_match) {

                const data = [{

                    feature_a: this.first_match,
                    feature_b: id,
                    run_match: this.run_match_instance,
                    pipe_section:this.pipe_section_instance

                }]


                this.dataAdapter.post('feature_pair', data, data => {
                    console.log('Pair matched',data)
                    this.fetchRest('pipe_section', this.pipe_section_instance, data => {
                        
                        this.pipe_section_raw = data
                        this.graphPipeSection()
                        
                    })
                })

                this.setState({match_on: false})

            } else

                this.first_match = id

    }

    fetchRest = (rest, instance, cbk) => {

        this.dataAdapter.get(rest, instance, cbk)
    }


    getGraphWidth = () => {

        this.pipe_section_graph_width = parseFloat(document.getElementById('pipe_graph_container').offsetWidth) - 20
        this.setState({screen_width:this.pipe_section_graph_width}, this.displayPipeSection)
        
    }



    setPipeSections = data => this.setState({pipe_section_select: <Typeahead

        id="basic-typeahead-single"
        onChange={e => {

            if (!e || !e[0] || !e[0].key)

                return
            
            this.pipe_section_instance = Number(e[0].key)
    
            this.fetchRest('pipe_section', this.pipe_section_instance, data => {
            
                this.pipe_section_raw = data
                this.setState({pipe_section_table: data.table})
                this.graphPipeSection()
            
            })

        }}
        options={data || []}
        placeholder="Pipe Section..." />

    })


    graphPipeSection = () => {

        const data = this.pipe_section_raw.features
        const width = this.pipe_section_graph_width

        let features = []

        for (let f in data)

            if ((this.state.filter.matched && data[f].matched) || (this.state.filter.unmatched && !data[f].matched)) {

                let feature = {...data[f]}

                feature.left = width / this.pipe_section_raw['weld_' + feature.side.toLowerCase() + '_width'] * data[f].left
                features.push(<Feature key={'feature_' + feature.id} feature={feature} onClick={this.clickFeature}/>)

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


    getGridColumn = item => {

        const matched = typeof item.value === 'boolean' && !item.value
        const style = {color: matched ? 'yellow' : '#212529', backgroundColor: matched ? 'yellow' : 'white'}
        return (<div style={style}>{ matched ? '_' : item.value  }</div>)
    }

    render() {

        return (

            <div>
                <div style={{backgroundColor:'#eee', display:'inline-block', padding:10, width:'100%'}}>
                    <div style={{alignItems:'baseline',display:'flex',float:'left'}}>
                        <Form.Label style={{marginRight:'10px'}}>Run:</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={e =>{
                                this.run_match_instance = Number(e.currentTarget.options[e.currentTarget.selectedIndex].value)
                                this.fetchRest('pipe_sections', null, this.setPipeSections)
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

                                this.first_match = 0
                                this.setState({match_on: !this.state.match_on})

                            }}
                        />

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
                <div style={{padding:10,maxWidth:(()=>this.state.screen_width&&this.state.screen_width+40+'px'||'auto')()}}>
                    <ReactDataGrid
                        
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
            
            </div>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
