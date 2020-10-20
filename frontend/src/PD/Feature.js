import React, { Component } from "react"
import PropTypes from 'prop-types'
import Popup from "reactjs-popup"
import './feature.css'

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

        this.enlarge = 10
        
    }


    render() {
    
        const offsetTop = 30
        const i = this.props.feature
        const a = i.attributes
        const border = i.side === 'A' ? 'orange' : 'blue'
        const minsize = 18
        const offset = {
            x: -17,
            y: -5
        }

        let left = isFinite(i.left) ? i.left : 0,
            top = -20,
            width = 28,
            height = 28,
            lt = false,
            nodim = true,
            isloss = false

        if (i.height && i.width) {

            height = Math.max(i.height, minsize)
            width = Math.max(i.width, minsize)
            top = i.top + offset.x - height / 2
            nodim = false

            if (i.height <= minsize || i.width <= minsize)

                lt = true

        }

        if (a.feature_category === 'metal loss / mill anomaly') {

            isloss = true
            height = Math.max(i.height, 2)
            width = Math.max(i.width, 2)
            top = i.top + offset.x - Math.floor(height / 2)

        }

        left -= width / 2

        const icowh = Math.round(Math.min(height, width) - 4)

        return (
            <Popup
                key={i.id + 'popup'}
                trigger={
                    <div
                        id={i.id}
                        onClick={e => this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                        style={{
                            backgroundColor: this.props.matchMode ? i.side === 'A' ? '#fed8b1' : 'lightblue' : 'transparent',
                            cursor: this.props.matchMode ? 'pointer' : 'default',
                            left: left + offset.y - this.enlarge,
                            top: top + offsetTop - this.enlarge,
                            height: height + this.enlarge * 2,
                            opacity: this.props.matchMode ? 0.8 : 1,
                            padding: this.enlarge,
                            width: width + this.enlarge * 2,
                            zIndex: this.props.matchMode ? 1 : 0
                        }}
                    >
                        <div
                            className={'shape ' + (i.matched ? 'matched' : 'unmatched') + (isloss ? ' isloss' : '')}
                            style={{
                                height: height,
                                width: width
                            }}
                        >
                            <div>
                                <div
                                    onMouseOver={e =>this.props.onHover(e.currentTarget.id)}
                                    onClick={e => !this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                                    id={i.id}
                                    style={{
                                        backgroundColor: !nodim ? border : 'none',
                                        padding: 1,
                                        border: "1px solid " + border,
                                        height: height,
                                        width: width
                                    }}
                                >
                                    {isloss || !nodim ? '' : (
                                        <img
                                            alt={a.feature_category}
                                            width={icowh}
                                            height={icowh}
                                            src={"./feature_icons/" + (this.icons[a.feature_category] || "unknown") + ".png"}
                                        />
                                    )}
                                </div>
                                {lt && !isloss ? (<div>&lt;</div>) : ''}
                            </div>
                            {nodim ? (<div></div>) : ''}
                        </div>
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
                                'depth_in',
                                'comments'
                            ]
                            
                            let out = [
                                (<b key="id_info">id:</b>),(<span key="item_info">{item.id}</span>),(<br key="break_info"/>),
                                (<b key="f_id_info">feature_id:</b>),(<span key="f_item_info">{item.feature_id}</span>),(<br key="f_break_info"/>),
                                (<b key="side_info">side:</b>),(<span key="side_info_val">{item.side}</span>),(<br key="side_info_br"/>)
                            ]

                            disp.forEach((a, i) => {
                                out.push(<b key={a + i + 'b'}>{a}</b>)
                                out.push(<span key={a + i + 'c'}>:</span>)
                                out.push(<span key={a + i + 'd'}>{data[a]}</span>)
                                out.push(<br key={a + i + 'e'} />)
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
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired,
    matchMode: PropTypes.bool.isRequired

}
