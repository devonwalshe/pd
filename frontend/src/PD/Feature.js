import React, { Component } from "react";
import PropTypes from 'prop-types';
import Popup from "reactjs-popup";
import './feature.css';

export default class Feature extends Component {

    constructor(props) {

        super(props)

        this.icons = {

            agm: 'agm',
            bend: 'bend',
            casing: 'casing',
            fitting: 'fitting',
            flange: 'flange',
            metal_loss: 'metal_loss',
            repair: 'repair',
            stopple: 'stopple',
            tee: 'tee',
            txt: 'txt',
            valve1: 'valve1',
            valve2: 'valve2',
            'metal loss / mill anomaly': 'metal_loss'
        }
        
        
    }


    render() {
    
        const i = this.props.feature
        const a = i.attributes

        const border = i.side === 'A' ? 'orange' : 'blue'

        return (<Popup
                key={i.id + 'popup'}
                trigger={
                    <div
                        className={"shape" + (i.matched ? "" : " unmatched")}
                        key={i.id}
                        id={i.id}
                        onClick={this.props.onClick}
                        style={{
                            border: "2px solid " + border,
                            left: i.left,
                            top: 360 - i.top
                        }}>
                        <img
                            width="20px"
                            height="20px"
                            src={"./feature_icons/" + (this.icons[a.feature_category] || "unknown") + ".png"}
                            />
                    </div>
                }
                keepTooltipInside="#root"
                on="hover"
                
            >
                <div className="card">
                    <div className="content">
                        {((item, data) => {
                            let out = [(<b key="id_info">id:</b>),(<span key="item_info">{item.id}</span>),(<br key="break_info"/>)]
                            for (let attr in data) {
                                out.push (<b key={attr + 'b'}>{attr}</b>)
                                out.push (<span key={attr + 'c'}>:</span>)
                                out.push (<span key={attr + 'd'}>{data[attr]}</span>)
                                out.push (<br key={attr + 'e'} />)
                            }
                            return out
                        })(i,a)}
                    </div>
                </div>                
            </Popup>
        )
    }

}

Feature.propTypes = {

    feature: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired

}
