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

            keyLock: false

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
    s

    //Valves, Markers, Flanges, Casings, Sleeves and Welds 



    _isMounted = false


    componentWillUnmount() {

        this._isMounted = false

    }

    componentDidMount() {

        this._isMounted = true

    }

    componentDidUpdate() {

        if (this.state.keyLock !== this.props.keyLock)

            this.setState({keyLock: this.props.keyLock})


    }
    

    dragDiv = e => {

        const pop = document.getElementsByClassName("popup-content")

        pop && pop[0] && (pop[0].style.display = "none")

        const elmnt = e.currentTarget
//console.log(elmnt.id)
        elmnt.style.zIndex = 3

        this.props.onClick(Number(elmnt.id))

        e = e || window.event
        e.preventDefault()


        const rect = elmnt.getBoundingClientRect()
//console.log(rect)
        this.cursorOff.x = rect.width / 2 - e.clientX + rect.left
        this.cursorOff.y = this.props.feature.isBar ? 0 : rect.height / 2  - e.clientY + rect.top

        let posX = e.clientX,
            posY = e.clientY

        document.onmouseup = () => {

            document.onmouseup = null
            document.onmousemove = null

        }

        document.onmousemove = e => {

            this.mouseMoved = true

            e = e || window.event
            e.preventDefault()

            elmnt.style.left = (elmnt.offsetLeft - posX + e.clientX) + "px"
            elmnt.style.top = (elmnt.offsetTop - posY + e.clientY) + "px"

            posX = e.clientX
            posY = e.clientY

            const l = e.clientX - this.container.left + this.cursorOff.x
            const t = e.clientY - this.container.top + this.cursorOff.y
            
            this.props.onMouseMove(elmnt.id, l, t)

        }
        
    }



    plotFeature = () => {

        const feature = this.props.feature

        const border = feature.side === "A" ? "orange" : "blue"
        const category = feature.attributes.category
        const left = feature.pos.left
        const top = feature.pos.top
        const width = feature.pos.width
        const height = feature.pos.height
        const isBar = feature.isBar
        const isLoss = feature.isLoss
        const noDim = feature.noDim
        const matchTarget = feature.matchTarget
        const matched = feature.matched
        const id = feature.id        
        const icowh = Math.round(Math.min(height, width) - 4)
        const backgroundColor = matchTarget ? feature.side === "A" ? "#fed8b1" : "lightblue" : "transparent"
        const cursor = this.state.keyLock && (!matched || matchTarget) ? "pointer" : "default"

        return (
            <div
                id={id}
                onMouseDown={e => !matched && this.dragDiv(e)}
                onMouseUp={e => {

                    if (!this.mouseMoved)

                        return

                    e = e || window.event
                    e.preventDefault()
            
                    const el = e.currentTarget

                    el.style.left = (left - this.enlarge) + "px"
                    el.style.top = (top - this.enlarge) + "px"

                    const l = e.clientX - this.container.left + this.cursorOff.x
                    const t = e.clientY - this.container.top + this.cursorOff.y
                    
                    this.props.onMouseUp(el.id, l, t)


                }}
                onMouseOver={e => {
                    const el = e.currentTarget
                    this.props.onHover(el.id)
                }}
                //onClick={e => !matched && !matchTarget && this.props.onClick(Number(e.currentTarget.id))}
                style={{
                    backgroundColor: backgroundColor,
                    border: "1px solid transparent",
                    cursor: cursor,
                    left: left - this.enlarge - 1,
                    top: top - this.enlarge - 1,
                    height: height + this.enlarge * 2 + 2,
                    width: width + this.enlarge * 2 + 2,
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                {(() => isBar && (
                        <div
                            className={"matchbg " + (matched ? "" : "unmatched")}
                            id={id}
                            style={{
                                backgroundColor: category !== "sleeve" ? "gray": "darkblue",
                                height: height,
                                width: width
                            }}
                        >
                        </div>
                    ) || (
                        <div
                            className={"shape matchbg " + (matched ? "" : "unmatched") + (isLoss ? " isloss" : "")}
                            style={{
                                border: "1px solid " + border,
                                height: height + 2,
                                width: width + 2
                            }}
                        >
                            {isLoss || !noDim ? "" : (
                                <img
                                    alt={category}
                                    width={icowh}
                                    height={icowh}
                                    src={"../feature_icons/" + (this.icons[category] || "unknown") + ".png"}
                                />
                            )}
                            {noDim ? (<div></div>) : ""}
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
    onMouseUp: PropTypes.func.isRequired

}
