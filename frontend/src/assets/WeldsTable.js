import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class WeldsTable extends Component {

    constructor(props) {

        super(props)

        this.state = {}

        this.section_id = ''

    }

    componentDidUpdate(props) {
        
        if (this.section_id !== props.section_id) {

            ['A','B'].forEach(side => this.props.columns.map(col => this.setState({[side + col.key]: props.welds[side][col.key]})))
            this.section_id = props.section_id

        }

    }

    styles = {
        table: {
            display: 'table',
            fontSize: 'smaller',
            padding: '5px',
            width: '100%'
        },
        table_div: {
            display: 'table-cell'
        },
        table_div_div: {
            border: '1px solid gray',
            display: 'inline-block',
            padding: '0px 3px 0px 3px',
            width: '100%'
        },
        table_side_A: {
            borderTop: '3px solid orange',
            borderBottom: 'none'
        },
        table_side_B: {
            borderTop: '3px solid blue',
            borderBottom: 'none'
        }
    }

    render = () => (
        <div style={this.styles.table}>
            {(() => ['A','B'].map(side => this.props.columns.map(col => (
                <div
                    key={side + col.key}
                    style={this.styles.table_div}
                >
                    <div style={{...this.styles.table_div_div, ...this.styles['table_side_' + side]}}>
                        {col.name}
                    </div>
                    <div style={this.styles.table_div_div}>
                        {this.state[side + col.key] || '\u00A0'}
                    </div>
                </div>
            ))))()}
        </div>
    )

}

WeldsTable.propTypes = {

    section_id: PropTypes.string.isRequired,
    welds: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired

}