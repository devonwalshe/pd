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

        this.bars = ['valve', 'valve1', 'valve2', 'flange', 'casing']

        this.enlarge = 10
        this.offsetY = 43
        this.offsetFeat = {
            y: -30,
            x: -5
        }

    }


    //Valves, Markers, Flanges, Casings, Sleeves and Welds 

    getBar = (feat, attr) => {

        const width = 3
            
        let left = isFinite(feat.left) ? feat.left : 0

        left -= width / 2

        return (
            <div
                id={feat.id}
                onClick={e => this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                style={{
                    backgroundColor: this.props.matchMode ? feat.side === 'A' ? '#fed8b1' : 'lightblue' : 'transparent',
                    cursor: this.props.matchMode ? 'pointer' : 'default',
                    left: left + this.offsetFeat.x - this.enlarge,
                    top: this.offsetY,
                    height: 360,
                    opacity: this.props.matchMode ? 0.8 : 1,
                    paddingLeft: this.enlarge,
                    paddingRight: this.enlarge,
                    width: width,
                    zIndex: this.props.matchMode ? 1 : 0
                }}
            >
                <div
                    className={"matchbg " + (feat.matched ? '' : 'unmatched')}
                    onMouseOver={e => this.props.onHover(e.currentTarget.id)}
                    onClick={e => !this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                    id={feat.id}
                    style={{
                        backgroundColor: attr.feature_category !== "sleeve" ? "gray": "darkblue",
                        height: 360,
                        width: width
                    }}
                >
                </div>
            </div>
        )

    }

    getIcon = (feat, attr) => {

        const border = feat.side === 'A' ? 'orange' : 'blue'
        const minsize = 18

        let left = isFinite(feat.left) ? feat.left : 0,
            top = -20,
            width = 28,
            height = 28,
            nodim = true,
            isloss = false

        if (feat.height && feat.width) {

            height = Math.max(feat.height, minsize)
            width = Math.max(feat.width, minsize)
            top = feat.top + this.offsetFeat.y - height / 2
            nodim = false

        }

        if (attr.feature_category === 'metal loss / mill anomaly') {

            isloss = true
            height = Math.max(feat.height, 2)
            width = Math.max(feat.width, 2)
            top = feat.top + this.offsetFeat.y - Math.floor(height / 2)

        }

        left -= width / 2

        const icowh = Math.round(Math.min(height, width) - 4)

        return (
            <div
                id={feat.id}
                onClick={e => this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                style={{
                    backgroundColor: this.props.matchMode ? feat.side === 'A' ? '#fed8b1' : 'lightblue' : 'transparent',
                    cursor: this.props.matchMode ? 'pointer' : 'default',
                    left: left + this.offsetFeat.x - this.enlarge,
                    top: top + this.offsetY - this.enlarge,
                    height: height + this.enlarge * 2,
                    opacity: this.props.matchMode ? 0.8 : 1,
                    padding: this.enlarge,
                    width: width + this.enlarge * 2,
                    zIndex: this.props.matchMode ? 1 : 0
                }}
            >
                <div
                    className={'shape matchbg ' + (feat.matched ? '' : 'unmatched') + (isloss ? ' isloss' : '')}
                    style={{
                        height: height,
                        width: width
                    }}
                >
                    <div>
                        <div
                            onMouseOver={e => this.props.onHover(e.currentTarget.id)}
                            onClick={e => !this.props.matchMode ? this.props.onClick(e.currentTarget.id) : () => false}
                            id={feat.id}
                            style={{
                                padding: 1,
                                border: "1px solid " + border,
                                height: height,
                                width: width
                            }}
                        >
                            {isloss || !nodim ? '' : (
                                <img
                                    alt={attr.feature_category}
                                    width={icowh}
                                    height={icowh}
                                    src={"../feature_icons/" + (this.icons[attr.feature_category] || "unknown") + ".png"}
                                />
                            )}
                        </div>
                    </div>
                    {nodim ? (<div></div>) : ''}
                </div>
            </div>
        )
    }


    render() {
    
        const feat = this.props.feature
        const attr = feat.attributes
        
        return (
            <Popup
                key={feat.id + 'popup'}
                trigger={(() => ~this.bars.indexOf(attr.feature_category) ? this.getBar(feat, attr) : this.getIcon(feat, attr))()}
                keepTooltipInside="#root"
                position="top center"
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
                        })(feat,attr)}
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
