import React, { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import useClickOutside from "../../../utils/useClickOutside";
import styled from 'styled-components'

const CustomColorPicker = ({ path, color, onChange }) => {
    const popover = useRef();
    const [isOpen, toggle] = useState(false);

    const close = useCallback(() => toggle(false), []);
    useClickOutside(popover, close);
    console.log(color, "color")
    return (
        <ColorPickerWrapper>
            <div className="picker" >
                <div
                    className="swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => toggle(true)}
                />

                {isOpen && (
                    <div className="popover" ref={popover}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>Color picker</div>
                            <div style={{ cursor: "pointer" }} onClick={() => toggle(false)}>X</div>
                        </div>
                        <HexColorPicker name={path} color={color} onChange={onChange} />
                    </div>
                )}
            </div>
        </ColorPickerWrapper>
    );
};
export default CustomColorPicker

const ColorPickerWrapper = styled.div`
.picker {
    position: relative;
  }
  .swatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 3px solid #fff;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
  .popover {
    // position: absolute;
    // top: calc(100% + 2px);
    // left: 0;
    border-radius: 9px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }`