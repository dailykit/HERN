import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import classes from "./styles.module.css";

const MultiRangeSlider = ({ forPrice = false, min, max, onChange }) => {
  const router = useRouter();
  const { startPrice, endPrice } = router.query;
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(Number(minVal));
    const maxPercent = getPercent(Number(maxValRef.current));
    if (range.current) {
      console.log({
        minVal,
        maxValRef: maxValRef.current,
        minPercent,
        maxPercent,
      });
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(Number(minValRef.current));
    const maxPercent = getPercent(Number(maxVal));

    if (range.current) {
      console.log({
        maxVal,
        minValRef: minValRef.current,
        minPercent,
        maxPercent,
      });
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    if (startPrice && endPrice) {
      // const minValue = Math.min(Number(startPrice), Number(startPrice) - 1);
      //     setMinVal(minValue);
      //     minValRef.current = minValue;
      minValRef.current = Number(startPrice);
      maxValRef.current = Number(endPrice);
      setMinVal(Number(startPrice));
      setMaxVal(Number(endPrice));
    }
  }, [startPrice, endPrice]);

  // Get min and max values when their state changes
  //   useEffect(() => {
  //     onChange({ min: minVal, max: maxVal });
  //   }, [minVal, maxVal, onChange]);

  return (
    <div className={classes.container}>
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          minValRef.current = value;
        }}
        onMouseUp={() => onChange({ min: minVal, max: maxVal })}
        className={`${classes.thumb} ${classes.thumb__left}`}
        style={{ zIndex: minVal > max - 100 && "5" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          maxValRef.current = value;
        }}
        onMouseUp={() => onChange({ min: minVal, max: maxVal })}
        className={`${classes.thumb} ${classes.thumb__right}`}
      />

      <div className={classes.slider}>
        <div className={classes.slider__track} />
        <div ref={range} className={classes.slider__range} />
        <div className={classes.slider__left_value}>
          {forPrice && "$"} {minVal}
        </div>
        <div className={classes.slider__right_value}>
          {forPrice && "$"} {maxVal}
        </div>
      </div>
    </div>
  );
};

MultiRangeSlider.propTypes = {
  forPrice: PropTypes.bool.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultiRangeSlider;
