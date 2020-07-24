import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'
import Popup from "reactjs-popup";

export default class PD extends Component {

    constructor(props) {

        super(props)
console.log(props)
        this.state = {
            isPopoverOpen: false,
            pipe_section: []

        }

        

    }


    componentDidUpdate(previousProps, previousState) {
        if (previousProps.id !== this.props.id)
            this.drawPipe()
    }

    //componentDidMount() {

      //  this.drawPipe()
    
    //}

    drawPipe = () => {

        const shapes = {

            flange: data => (
                <Popup
                    key={data.id + 'popup'}
                    trigger={
                        <div
                            key={data.id}
                            style={{
                                backgroundColor:'#888',
                                border:'1px solid #333',
                                borderRadius:'50%',
                                height:'30px',
                                left: width / w * data.left + 'px',
                                position: 'absolute',
                                top:'20px',
                                width:'20px'
                            }}>
                        </div>
                    }
                    keepTooltipInside="#pipeline_graph_container"
                    on="hover"
                >
                    {this.tooltip(data)}
                </Popup>),
                
            valve: data => (
                <Popup
                    key={data.id + 'popup'}
                    trigger={
                        <div
                            key={data.id}
                            style={{
                                backgroundColor:'blue',
                                border:'2px solid black',
                                height:'20px',
                                left: width / w * data.left + 'px',
                                position: 'absolute',
                                top:'25px',
                                width:'20px'
                            }}></div>
                    }
                    keepTooltipInside="#pipeline_graph_container"
                    on="hover"
                >
                    {this.tooltip(data)}
                </Popup>)

        }

        let features = [],
            width = 800,
            w = 0,
            out = []

        const pipe = this.props.pipe_section && this.props.pipe_section.features || []

        for (let i = 0, ix = pipe.length; i < ix; i += 1) {

            let feature = {

                    feature_category: null,
                    us_weld_dist_wc_ft: null,
                    id: null

                }

            for (let j = 0, jx = pipe[i].attributes.length; j < jx; j += 1) {

                const attr = pipe[i].attributes[j].attribute_name
                const data = pipe[i].attributes[j].attribute_data

                if (attr in feature) {

                    feature.id = pipe[i].attributes[j].id
                    feature[attr] = data

                    if (attr === 'us_weld_dist_wc_ft') {

                        w += Number(data)
                        feature.left = w
                    }

                }
                
            }
            console.log(feature)
            feature.feature_category && shapes[feature.feature_category] && out.push(feature)

        }

        for (let i = 0, ix = out.length; i < ix; i +=1 )
            features.push(shapes[out[i].feature_category](out[i]))

        console.log(out,this.props, width, w)
        this.setState({pipe_section: features})
    
        //return [<div>test</div>]

    }

    render() {

        return (

            <div id="pipe_graph" style={{width: '100%'}}>
                {this.state.pipe_section}
            </div>
            
        )
    }

    tooltip = data => (
        <div className="card">
          <div className="header">{data.feature_category}</div>
          <div className="content">
            upstream distance: {data.us_weld_dist_wc_ft}
          </div>
        </div>
    )
    
}


PipeSection.propTypes = {

    pipe_section: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired

}
