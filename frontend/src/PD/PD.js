import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Form, Dropdown, Toast } from 'react-bootstrap';
import Popup from "reactjs-popup";
import DownshiftCheckbox from "../DownshiftCheckbox/DownshiftCheckbox";
import fontawesome from '@fortawesome/fontawesome'
import { faSpinner, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'

fontawesome.library.add(faSpinner, faSearchPlus, faSearchMinus);

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            features_add: [],
            features_filter: [],
            is_loading: false,
            rest_error: false,
            pipe_section: [],
            pipe_sections: [],
            pipe_section_instance: 0,
            run_matches: [],
            run_match_instance: 0

        }

        this.pipe_section_graph_width = 0
        this.pipe_section_raw = {}

    }


    componentDidMount() {

        this.getGraphWidth()
        this.setPipeFeatures()
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
                    console.log(e)
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

        const i = Number(e.currentTarget.options[e.currentTarget.selectedIndex].value)
        
        this.fetchRest('pipe_section', i, data => {
            
            this.pipe_section_raw = data
            this.setPipeFeatures()
            this.displayPipeSection()
            
        })
        

    }

    setPipeFeatures = data => {

        const pipe = this.pipe_section_raw.features || []

        let features = [],
            out = []

        for (let i = 0, ix = pipe.length; i < ix; i += 1)

            for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {

                const { attribute_data, attribute_name } = pipe[i].attributes[j]

                if (attribute_name === 'feature_category' && !~features.indexOf(attribute_data)) {

                    features.push(attribute_data)
                    out.push({label: attribute_data, value: attribute_data})

                }
            }
        
        const features_add = out.map((item, index) => <Dropdown.Item key={index} onClick={()=>alert(item.value)}>{item.label}</Dropdown.Item>)
        const features_filter = <DownshiftCheckbox key="feature_filter" itemToString={item => (item ? item.label : "")}>
            {({
                getToggleButtonProps,
                selectedItems,
                getItemProps,
                isOpen,
                actionType
            }) => (
                <div className="custom-select-checkbox">
                <button {...getToggleButtonProps()} className="custom-select-button">
                    Features Filter
                </button>
                {!isOpen ? null : (
                    <div className={`item-list ${isOpen ? "open" : ""} `}>
                        {out.map((item, index) => (
                            <label
                                className="checkbox-label custom-select-label"
                                htmlFor={item.value}
                                key={item.value}
                            >
                            <input
                                type="checkbox"
                                {...getItemProps({
                                    item,
                                    index,
                                    checked: selectedItems.includes(item)
                                })}
                                id={item.value}
                                value={item.value}
                                onChange={() => null}
                            />
                            <span />
                            {item.label}
                            </label>
                        ))}
                    </div>
                )}
                </div>
            )}
        </DownshiftCheckbox>
    
        this.setState({features_add: features_add, features_filter: [features_filter]})

    }

    setPipeSections = data => {

        const run_match = Number(this.state.run_match_instance)
        
        let options = []

        for (let i = 0, ix = data.length; i < ix; i += 1)

            if (run_match === data[i].run_match)
            
                options.push(<option key={i} value={data[i].id}>{data[i].section_id}</option>)

        this.setState({pipe_sections: options})

    }

    displayPipeSection = () => {

        const supported = ['flange','valve']

        let features = [],
            w = 0,
            out = [],
            width = this.pipe_section_graph_width

        const pipe = this.pipe_section_raw.features || []

        for (let i = 0, ix = pipe.length; i < ix; i += 1) {
console.log(ix)
            let feature = {

                    attributes: {},
                    id: pipe[i].id

                }

            for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {

                const { attribute_data, attribute_name } = pipe[i].attributes[j]

                feature.attributes[attribute_name] = attribute_data

                if (attribute_name === 'us_weld_dist_wc_ft')
                
                    feature.left = w += Number(attribute_data)

            }
            
            feature.attributes.feature_category && out.push(feature)

        }
        console.log(out,w)
        for (let i = 0, ix = out.length; i < ix; i +=1){
            console.log(width / w * out[i].left + 'px')
            features.push(<Popup
                key={out[i].id + 'popup'}
                trigger={
                    <div
                        className={"shape " + (!~supported.indexOf(out[i].attributes.feature_category) ? 'unknown' : out[i].attributes.feature_category)}
                        key={out[i].id}
                        style={{
                            left: width / w * out[i].left + 'px'
                        }}>
                    </div>
                }
                keepTooltipInside="#pipeline_graph_container"
                on="hover"
            >
                <div className="card">
                    <div className="content">
                        {(data => {
                            let out = []
                            for (let attr in data) {
                                out.push (<b key={attr + 'b'}>{attr}</b>)
                                out.push (<span key={attr + 'c'}>:</span>)
                                out.push (<span key={attr + 'd'}>{data[attr]}</span>)
                                out.push (<br key={attr + 'e'} />)
                            }
                            return out
                        })(out[i].attributes)}
                    </div>
                </div>                
            </Popup>)
        }
        console.log(features)
        this.setState({pipe_section: features})

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
                        <Form.Control as="select" onChange={this.selectPipeSection} style={{width:'200px'}}>
                            <option>Pipe Sections...</option>
                            {this.state.pipe_sections}
                        </Form.Control>
                    </div>
                    {this.state.is_loading && (<div style={{float:'right'}}>
                        <i className="fa fa-spinner fa-spin" />
                    </div>)}
                </div>
                <div style={{backgroundColor:'#fff', display:'inline-block', padding:10, width:'100%'}}>
                    <div style={{display:"flex", float:"left"}}>
                        {this.state.features_filter}
                        <div style={{width:'15px'}}></div>
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                Add Feature
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.state.features_add}
                            </Dropdown.Menu>
                        </Dropdown>
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
                        <div id="pipe_section_graph" style={{height: '100%',width: '100%', backgroundColor: '#ddd'}}>
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
