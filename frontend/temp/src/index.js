import React from "react";
import { render } from "react-dom";
import { css } from "./shared";
import "./downshift-checkbox.css";
import DownshiftCheckbox from "./DownshiftCheckbox";

const starwarsNames = [
  { label: "Lando Calrissian", value: "lc" },
  { label: "Syresh Flast", value: "sf" },
  { label: "Archlonus Llandon", value: "al" },
  { label: "Jar-Tan  Talon", value: "jt" },
  { label: "Barriss Offee", value: "bo" },
  { label: "General Grievous", value: "gg" },
  { label: "Grand Moff Tarkin", value: "gmt" },
  { label: "Han Solo", value: "hs" },
  { label: "Luke Skywalker", value: "ls" },
  { label: "Shmi Skywalker", value: "ssk" }
];

class App extends React.Component {
  render() {
    return (
      <div
        {...css({
          display: "flex",
          flexDirection: "column",
          marginTop: 50
        })}
      >
        <DownshiftCheckbox itemToString={item => (item ? item.label : "")}>
          {({
            getButtonProps,
            selectedItems,
            getItemProps,
            isOpen,
            actionType
          }) => (
            <div className="custom-select-checkbox">
              <button {...getButtonProps()} className="custom-select-button">
                Select a star Wars Character
              </button>
              {!isOpen ? null : (
                <div className={`item-list ${isOpen ? "open" : ""} `}>
                  {starwarsNames.map((item, index) => (
                    <label
                      className="checkbox-label custom-select-label"
                      htmlFor={item.value}
                      key={item.value}
                    >
                      <input
                        type="checkbox"
                        {...getItemProps({
                          item,
                          index,
                          checked: selectedItems.includes(item)
                        })}
                        id={item.value}
                        value={item.value}
                        onChange={() => null}
                      />
                      <span />
                      {item.label}
                    </label>
                  ))}
                </div>
              )}
              <pre>
                {selectedItems.length > 0
                  ? JSON.stringify(selectedItems, null, 2)
                  : null}
              </pre>
              <pre>{JSON.stringify(actionType, null, 2)}</pre>
            </div>
          )}
        </DownshiftCheckbox>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
