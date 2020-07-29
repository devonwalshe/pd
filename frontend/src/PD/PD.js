import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Dropdown, Toast } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import Feature from './Feature.js'
import fontawesome from '@fortawesome/fontawesome'
import { faCrosshairs, faFilter, faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import Toggle from 'react-bootstrap-toggle'

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
            pipe_section: [],
            pipe_section_select: [],
            pipe_section_instance: 0,
            run_matches: [],
            run_match_instance: 0

        }

        this.pipe_section_graph_width = 0
        this.pipe_section_raw = {}

    }


    componentDidMount() {

        this.getGraphWidth()
        this.setPipeSections()
        this.fetchRest('run_matches', null, (data) => {

            this.setRunMatches(data, null, this.setRunMatches)

        })

        window.addEventListener('resize', () => this.getGraphWidth())
        

    }


    fetchRest = (rest, instance, cbk) => {

        const url = this.props.proxyURL + '?' + encodeURIComponent(this.props.restURL) + rest + (instance ? '/' + instance : '')

        this.setState({is_loading:true}, () => 
            fetch(url)
                .then(res => res.json())
                .then((data) => {
                    this.setState({is_loading:false})
                    cbk(data, instance)
                })
                .catch(e => {
                    this.setState({is_loading:false})
                    this.setState({rest_error: true})
                })
        )
    }


    getGraphWidth = () => {

        this.pipe_section_graph_width = parseFloat(document.getElementById('pipe_section_graph').offsetWidth) - 20
        this.displayPipeSection()

    }

    selectRunMatch = e => {

        const i = e.currentTarget.options[e.currentTarget.selectedIndex].value

        this.setState({run_match_instance: i}, () => this.fetchRest('pipe_sections', null, this.setPipeSections))

    }

    
    setRunMatches = data => {

        let options = []

        for (let i = 0, ix = data.length; i < ix; i += 1)
        
            options.push(<option key={i} value={data[i].pipeline}>{data[i].id + ':' + data[i].run_a + '_' + data[i].run_a}</option>)

        this.setState({run_matches: options})

    }

    selectPipeSection = e => {

        if (!e || !e[0] || !e[0].key)

            return

        const i = Number(e[0].key)
        
        this.fetchRest('pipe_section', i, data => {
            
            this.pipe_section_raw = data
            this.displayPipeSection()
            
        })
        

    }


    setPipeSections = data => {

        const run_match = Number(this.state.run_match_instance)
        
        let options = []

        for (let i = 0, ix = (data || []).length; i < ix; i += 1)

            if (run_match === data[i].run_match) //## this line will need to remove once RESTful supports run_match filter
          
                options.push({key: i, label: data[i].section_id})

        const select = <Typeahead
                        id="basic-typeahead-single"
                        onChange={this.selectPipeSection}
                        options={options}
                        placeholder="Pipe Section..." />

        this.setState({pipe_section_select: select})

    }

    displayPipeSection = () => {

        let features = [],
            w = 0,
            out = [],
            width = this.pipe_section_graph_width

        const pipe = this.pipe_section_raw.features || []

        for (let i = 0, ix = pipe.length; i < ix; i += 1) {

            let feature = {

                    attributes: {},
                    id: pipe[i].id,
                    side: pipe[i].side,
                    matched: pipe[i].matched,
                    left: 0,
                    top: 0

                }

            for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {

                const { attribute_data, attribute_name } = pipe[i].attributes[j]

                feature.attributes[attribute_name] = attribute_data

                if (attribute_name === 'us_weld_dist_wc_ft')
                
                    feature.left = w += Number(attribute_data)

                else if (attribute_name === 'orientation_deg')

                    feature.top = Number(attribute_data)

            }
            
            feature.attributes.feature_category && ((this.state.filter.matched && feature.matched) || this.state.filter.unmatched && !feature.matched) && out.push(feature)

        }

        for (let i = 0, ix = out.length; i < ix; i +=1) {

            out[i].left = width / w * out[i].left
            features.push(<Feature key={'feature_' + i} feature={out[i]} />)

        }
        
        this.setState({pipe_section: features})

    }
    
    setMatchFilter = e => {

        const val = e.target.value
        const filter = {
            matched: val === 'matched' ? !this.state.filter.matched : this.state.filter.matched,
            unmatched: val === 'unmatched' ? !this.state.filter.unmatched : this.state.filter.unmatched,
        }

        this.setState({filter: filter}, this.displayPipeSection)

    }


    render() {

        return (

            <div>
                <div style={{backgroundColor:'#eee', display:'inline-block', padding:10, width:'100%'}}>
                    <div style={{alignItems:'baseline',display:'flex',float:'left'}}>
                    
                        <Form.Label style={{marginRight:'10px'}}>Run:</Form.Label>
                        <Form.Control as="select" onChange={this.selectRunMatch} style={{width:'200px'}}>
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
                            onClick={() => this.setState({match_on: !this.state.match_on})}
                        />

                    </div>
                    <div style={{display:'flex', direction:'row', alignItems:"center", float:"right"}}>
                        <i className="fa fa-search-minus" style={{marginRight:'10px'}}></i>
                        <Form.Control type="text" placeholder="1" style={{width:'50px'}} />
                        <i className="fa fa-search-plus" style={{marginLeft:'10px'}}></i>
                    </div>
                </div>
                <div className="pipeline_graph_container" id="pipeline_graph_container">
                    <div style={{position:"absolute"}}>
                    <Toast onClose={() => this.setState({rest_error: false})} show={this.state.rest_error} animation={false}>
                        <Toast.Header>
                        <strong className="mr-auto">Error</strong>
                            <small></small>
                        </Toast.Header>
                        <Toast.Body>Invalid response from server</Toast.Body>
                    </Toast>
                    </div>
                    <div style={{height: '100%',width: '100%',padding:10}}>
                        <div id="pipe_section_graph" style={{height: '100%',width: '100%', position:'relative', backgroundColor: '#ddd'}}>
                            {this.state.pipe_section}
                        </div>
                    </div>
                </div>

            </div>
            
        )

    }

}


PD.propTypes = {

    proxyURL: PropTypes.string.isRequired,
    restURL: PropTypes.string.isRequired

}
