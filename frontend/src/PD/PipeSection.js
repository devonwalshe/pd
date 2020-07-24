import React, { Component } from "react";
import PropTypes from 'prop-types';
import PipeSection from './PipeSection.js'
import Popup from "reactjs-popup";

export default class PD extends Component {

    constructor(props) {

        super(props)

        this.state = {

            isPopoverOpen: false,
            pipe_section: []

        }

    }


    componentDidUpdate(previousProps) {

        if (previousProps.id !== this.props.id)
            this.drawPipe()

    }


    drawPipe = () => {

        const shapes = {

            flange: data => (
                <Popup
                    key={data.id + 'popup'}
                    trigger={
                        <div
                            className="shape flange"
                            key={data.id}
                            style={{
                                left: width / w * data.left + 'px'
                            }}>
                        </div>
                    }
                    keepTooltipInside="#pipeline_graph_container"
                    on="hover"
                >
                    {this.tooltip(data.attributes)}
                </Popup>),

            valve: data => (
                <Popup
                    key={data.id + 'popup'}
                    trigger={
                        <div
                            className="shape valve"
                            key={data.id}
                            style={{
                                left: width / w * data.left + 'px'
                            }}></div>
                    }
                    keepTooltipInside="#pipeline_graph_container"
                    on="hover"
                >
                    {this.tooltip(data.attributes)}
                </Popup>)

        }

        let features = [],
            width = 800,
            w = 0,
            out = []

        const pipe = (this.props.pipe_section && this.props.pipe_section.features) || []

        for (let i = 0, ix = pipe.length; i < ix; i += 1) {

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
            
            feature.attributes.feature_category && shapes[feature.attributes.feature_category] && out.push(feature)

        }

        for (let i = 0, ix = out.length; i < ix; i +=1 )

            features.push(shapes[out[i].attributes.feature_category](out[i]))

        this.setState({pipe_section: features})

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
          <div className="content">
            {(()=>{
                let out = []
                for (let attr in data) {
                  out.push (<b key={attr + 'b'}>{attr}</b>)
                  out.push (<span key={attr + 'c'}>:</span>)
                  out.push (<span key={attr + 'd'}>{data[attr]}</span>)
                  out.push (<br key={attr + 'e'} />)
                }
                return out
            })()}
          </div>
        </div>
    )
    
}


PipeSection.propTypes = {

    pipe_section: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired

}
