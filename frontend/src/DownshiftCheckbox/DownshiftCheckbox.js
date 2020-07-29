import React, { Component } from "react";
import Downshift from "downshift";

class DownshiftCheckbox extends Component {
  static displayName = "DownshiftCheckbox";
  state = { selectedItems: [] };

  stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          isOpen: true
        };
      default:
        return changes;
    }
  };
  handleSelection = (selectedItem, downshift) => {
    const callOnChange = () => {
      if (this.props.onSelect) {
        this.props.onSelect(
          this.state.selectedItems,
          this.getStateAndHelpers(downshift)
        );
      }
      if (this.props.onChange) {
        this.props.onChange(
          this.state.selectedItems,
          this.getStateAndHelpers(downshift)
        );
      }
    };
    // remove if already in the state; add otherwise
    if (this.state.selectedItems.includes(selectedItem)) {
      this.removeItem(selectedItem, callOnChange);
    } else {
      this.addSelectedItem(selectedItem, callOnChange);
    }
  };

  removeItem(item, callbackFunction) {
    this.setState(({ selectedItems }) => {
      return {
        selectedItems: selectedItems.filter(i => i !== item)
      };
    }, callbackFunction);
  }
  addSelectedItem(item, callbackFunction) {
    this.setState(
      ({ selectedItems }) => ({
        selectedItems: [...selectedItems, item]
      }),
      callbackFunction
    );
  }

  getStateAndHelpers(downshift) {
    const { selectedItems } = this.state;

    return {
      selectedItems,
      ...downshift
    };
  }
  render() {
    const { render, children = render, ...props } = this.props;

    return (
      <Downshift
        {...props}
        stateReducer={this.stateReducer}
        onChange={this.handleSelection}
        selectedItem={null}
      >
        {downshift => children(this.getStateAndHelpers(downshift))}
      </Downshift>
    );
  }
}

export default DownshiftCheckbox;
