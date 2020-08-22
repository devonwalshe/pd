import React, { Component } from 'react'
import { weldsTableColumns } from '../config'
import PropTypes from 'prop-types'

export default class WeldsTable extends Component {

    constructor(props) {

        super(props)

        this.state = {}

        console.log(props)
        this.section_id = ''

    }


    componentDidUpdate(props) {
        
        if (this.section_id !== props.section_id) {

            ['A','B'].forEach(s => weldsTableColumns.map(f => this.setState({[s + f]: props.welds[s][f]})))
            this.section_id = props.section_id

        }

    }

    render () {

        return (

            <div className="welds_table">

                {(() => ['A','B'].map(s => weldsTableColumns.map(f => (

                    <div key={s + f}><div>{f}</div><div>{this.state[s + f] || '\u00A0'}</div></div>
                    
                ))))()}

            </div>

        )

    }

}

WeldsTable.propTypes = {

    section_id: PropTypes.string.isRequired,
    welds: PropTypes.object.isRequired

}