import React, { Component } from "react";
import PropTypes from 'prop-types';
import Popup from "reactjs-popup";
import './feature.css';

export default class Feature extends Component {

    constructor(props) {

        super(props)

        this.supported = {
            flange: 'flange',
            valve: 'valve',
            'metal loss / mill anomaly': 'anomaly'
        }

    }


    render() {
    
        const i = this.props.feature
        const a = i.attributes

        return (<Popup
                key={i.id + 'popup'}
                trigger={
                    <div
                        className={"shape " + (this.supported[a.feature_category] || 'unknown') + ' side_' + i.side}
                        key={i.id}
                        style={{
                            left: i.left + 'px',
                            top: (360 - i.top) + 'px'
                        }}>
                            {i.matched ? '' : 'x'}
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
                        })(a)}
                    </div>
                </div>                
            </Popup>
        )
    }

}

Feature.propTypes = {

    feature: PropTypes.object.isRequired

}
