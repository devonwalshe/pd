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

        let left = i.left,
            top = -20,
            width = 28,
            height = 28,
            lt = false,
            nodim = true

        if (i.height && i.width) {

            top = i.top
            height = Math.max(i.height, 12)
            width = Math.max(i.width, 12)
            nodim = false

            if (i.height <= 12 || i.width <= 12)

                lt = true

        }

        return (
            <Popup
                key={i.id + 'popup'}
                trigger={
                    <div
                        className={"shape " + (i.matched ? "matched" : "unmatched")}
                        key={i.id}
                        style={{
                            left: left,
                            top: top,
                            height: height+4,
                            width: width+4}}
                    >
                        <div>
                            <div
                                onClick={e => Number(this.props.onClick(e.currentTarget.id))}
                                id={i.id}
                                style={{
                                padding: 1,
                                border: "1px solid " + border,
                                height: height,
                                width: width}}>
                                <img
                                    width={width - 4}
                                    height={height - 4}
                                    src={"./feature_icons/" + (this.icons[a.feature_category] || "unknown") + ".png"}
                                    />
                            </div>
                            {lt ? (<div>&lt;</div>) : ''}
                        </div>
                        {nodim ? (<div></div>) : ''}
                    </div>
                }
                keepTooltipInside="#root"
                on="hover"            
            >
                <div className="card">
                    <div className="content">
                        {((item, data) => {

                            const disp = [
                                'feature',
                                'feature_category',
                                'orientation_deg',
                                'us_weld_dist_wc_ft',
                                'us_weld_dist_coord_m',
                                'length_in',
                                'width_in',
                                'depth_in'
                            ]
                            
                            let out = [(<b key="id_info">feature_id:</b>),(<span key="item_info">{item.feature_id}</span>),(<br key="break_info"/>)]

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
