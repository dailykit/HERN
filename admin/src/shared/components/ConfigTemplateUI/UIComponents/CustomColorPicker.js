import React, { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import useClickOutside from "../../../utils/useClickOutside";
import styled from 'styled-components'
import { Input } from 'antd'
import { CloseIcon } from "../../../assets/icons";

const CustomColorPicker = ({ path, color, onChange, onConfigChange }) => {
    const popover = useRef();
    const [isOpen, toggle] = useState(false);

    const close = useCallback(() => toggle(false), []);
    useClickOutside(popover, close);

    const onChangeHandler = e => {
        const { value } = e.target
        onChange(value)
        console.log(color, "color")
            (color != '' || color != null) && onConfigChange(e, color)
    }
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
                        <div className="color-picker-header">
                            <div className="color-picker-title">Color picker</div>
                            <Input
                                strong
                                level={5}
                                style={{
                                    width: '45%',
                                    border: '2px solid #E4E4E4',
                                    borderRadius: '4px',
                                }}
                                bordered={false}
                                value={color}
                                onChange={onChangeHandler}
                                id="hex-color"
                                name={path}
                            />
                            <div style={{ cursor: "pointer" }} onClick={() => toggle(false)}><CloseIcon color="#000" size="14" /></div>
                        </div>
                        <HexColorPicker color={color} onChange={onChange} style={{ width: "100%", height: "170px" }} />
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
  .color-picker-header{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:0.5rem;
  }
  .color-picker-title{
      color:#524c4c;
      font-weight:600;
  }
  .popover {
    // position: absolute;
    // top: calc(100% + 2px);
    // left: 0;
    border-radius: 9px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }`