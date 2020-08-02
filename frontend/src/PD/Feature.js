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
                            border: "1px solid " + border,
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

                            const disp = ['feature_id',
                            'feature',
                            'feature_category',
                            'orientation_deg',
                            'us_weld_dist_wc_ft',
                            'us_weld_dist_coord_m',
                            'length_in',
                            'width_in',
                            'depth_in']
                            
                            let out = [(<b key="id_info">id:</b>),(<span key="item_info">{item.id}</span>),(<br key="break_info"/>)]

                            disp.map((a, i) => {
                                out.push(<b key={a + i + 'b'}>{a}</b>)
                                out.push (<span key={a + i + 'c'}>:</span>)
                                out.push (<span key={a + i + 'd'}>{data[a]}</span>)
                                out.push (<br key={a + i + 'e'} />)
                            })


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
