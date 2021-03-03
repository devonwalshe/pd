import React, { Component, createRef } from "react"
import PropTypes from "prop-types"
import Popup from "reactjs-popup"
import "./feature.css"

  
export default class Feature extends Component {

    constructor(props) {

        super(props)

        this.icons = {

            agm: "agm",
            bend: "bend",
            casing: "casing",
            fitting: "fitting",
            flange: "flange",
            metal_loss: "metal_loss",
            repair: "repair",
            stopple: "stopple",
            tee: "tee",
            txt: "txt",
            valve1: "valve1",
            valve2: "valve2",
            "metal loss / mill anomaly": "metal_loss"

        }

        this.state = {

            keyLock: false,
            matchMode: false

        }

        this.enlarge = 6

        this.coords = {}

        this.container = document.getElementById("plot_area").getBoundingClientRect()

        this.cursorOff = {

            x: 0,
            y: 0

        }
        
        this.mouseMoved = false
        
    }

    //Valves, Markers, Flanges, Casings, Sleeves and Welds 


    componentDidUpdate() {

        if (this.state.keyLock !== this.props.keyLock || this.state.matchMode !== this.props.matchMode)

            this.setState({

                keyLock: this.props.keyLock,
                matchMode: this.props.matchMode

            })

    }


    plotFeature = () => {

        const feature = this.props.feature
        const category = feature.attributes.feature_category
        const left = feature.pos.left
        const top = feature.pos.top
        const width = feature.pos.width
        const height = feature.pos.height
        const isBar = feature.isBar
        const isLoss = feature.isLoss
        const noDim = feature.noDim
        const matched = feature.matched
        const id = feature.id
        const firstMatch = feature.firstMatch === id ? true : false
        const icoWH = Math.round(Math.min(height, width) - 4)
        const matchMode = this.state.matchMode
        const backgroundColor = matchMode && !firstMatch ? feature.side === "A" ? "#fed8b1" : "lightblue" : "transparent"
        const iconBorder = "1px solid " + (feature.side === "A" ? "orange" : "blue")
        const barBackground = matchMode ? "gray" : matched ? category !== "sleeve" ? "gray": "darkblue" : feature.side === "A" ? "#fed8b1" : "lightblue"
        const cursor = this.state.keyLock && (!matched || !firstMatch) ? "pointer" : "default"

        const l = left - this.enlarge - 1
        const t = top - this.enlarge - 1
        const h = height + this.enlarge * 2 + 2
        const w = width + this.enlarge * 2 + 2

        return (
            <div
                id={id}
                onMouseDown={e => {

                    if (matched)

                        return

                    e = e || window.event
                    e.preventDefault()
                    
                    const el = e.currentTarget
                    const rect = el.getBoundingClientRect()
                    const pop = document.getElementsByClassName("popup-content")
            
                    pop && pop[0] && (pop[0].style.display = "none")
            
                    el.style.zIndex = 3
            
                    this.cursorOff.x = rect.width / 2 - e.clientX + rect.left
                    this.cursorOff.y = this.props.feature.isBar ? 0 : rect.height / 2  - e.clientY + rect.top
            
                    let posX = e.clientX,
                        posY = e.clientY
            
                    document.onmouseup = () => {
            
                        document.onmouseup = null
                        document.onmousemove = null
            
                    }
            
                    document.onmousemove = e => {
            
                        !this.mouseMoved && this.props.onClick(Number(el.id))
            
                        this.mouseMoved = true
            
                        if (this.state.keyLock)
            
                            return
            
                        e = e || window.event
                        e.preventDefault()
            
                        el.style.left = (el.offsetLeft - posX + e.clientX) + "px"
                        el.style.top = (el.offsetTop - posY + e.clientY) + "px"
            
                        posX = e.clientX
                        posY = e.clientY
            
                        const l = e.clientX - this.container.left + this.cursorOff.x
                        const t = e.clientY - this.container.top + this.cursorOff.y
            
                        this.props.onMouseMove(el.id, l, t)
            
                    }
            

                }}
                onMouseUp={e => {

                    e = e || window.event
                    e.preventDefault()
            
                    const el = e.currentTarget

                    if (!this.mouseMoved) {

                        this.state.keyLock && !matched && this.props.onClick(Number(el.id))
                        return

                    }

                    this.mouseMoved = false

                    el.style.left = (left - this.enlarge) + "px"
                    el.style.top = (top - this.enlarge) + "px"

                    el.style.zIndex = 1

                    const x = e.clientX - this.container.left + this.cursorOff.x
                    const y = e.clientY - this.container.top + this.cursorOff.y
                    
                    this.props.onMouseUp(el.id, x, y)


                }}
                onMouseOver={e => this.props.onHover(e.currentTarget.id)}
                style={{
                    backgroundColor:  backgroundColor,
                    border: "1px solid transparent",
                    cursor: cursor,
                    left: l,
                    top: t,
                    height: h,
                    width: w,
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 1,
                    alignItems: "center"
                }}
            >
                {(() => isBar && (
                        <div
                            className={"matchbg " + (matched ? "" : "unmatched")}
                            id={id}
                            style={{
                                backgroundColor: barBackground,
                                height: height,
                                width: width
                            }}
                        >
                        </div>
                    ) || (
                        <div
                            className={"shape matchbg " + (matched ? "" : "unmatched") + (isLoss ? " isloss" : "")}
                            style={{
                                position: "absolute",
                                textAlign: "center",                            
                                border: iconBorder,
                                height: height + 2,
                                width: width + 2
                            }}
                        >
                            {isLoss || !noDim ? "" : (
                                <img
                                    alt={category}
                                    width={icoWH}
                                    height={icoWH}
                                    src={"../feature_icons/" + (this.icons[category] || "unknown") + ".png"}
                                />
                            )}
                            {
                                noDim ? (
                                    <div
                                        style={{
                                            display: "flex"
                                        }}>
                                    </div>
                                ) : ""
                            }
                        </div>
                    ))()}
            </div>
        )
    }


    render = () => (
        <Popup
            key={this.props.feature.id + "popup"}
            trigger={this.plotFeature}
            keepTooltipInside="#root"
            position="top center"
            on="hover"
        >
            <div className="card">
                <div className="content">
                    {((item) => {

                        const disp = [
                            "feature",
                            "feature_category",
                            "orientation_deg",
                            "us_weld_dist_wc_ft",
                            "us_weld_dist_coord_m",
                            "length_in",
                            "width_in",
                            "depth_in",
                            "comments"
                        ]
                        
                        let out = [
                            (<b key="id_info">id:</b>),(<span key="item_info">{item.id}</span>),(<br key="break_info"/>),
                            (<b key="f_id_info">feature_id:</b>),(<span key="f_item_info">{item.feature_id}</span>),(<br key="f_break_info"/>),
                            (<b key="side_info">side:</b>),(<span key="side_info_val">{item.side}</span>),(<br key="side_info_br"/>)
                        ]

                        disp.forEach((a, i) => {
                            out.push(<b key={a + i + "b"}>{a}</b>)
                            out.push(<span key={a + i + "c"}>:</span>)
                            out.push(<span key={a + i + "d"}>{item.attributes[a]}</span>)
                            out.push(<br key={a + i + "e"} />)
                        })

                        return out
                    })(this.props.feature)}
                </div>
            </div>
        </Popup>
    )


}

Feature.propTypes = {

    feature: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired,
    onMouseMove: PropTypes.func.isRequired,
    onMouseUp: PropTypes.func.isRequired,
    keyLock: PropTypes.bool.isRequired,
    matchMode: PropTypes.bool.isRequired

}
