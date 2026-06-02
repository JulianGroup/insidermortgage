"use client";
import React from 'react';
import { NumericFormat } from 'react-number-format';

export default function CurrencyInput({ value, onChange, placeholder, style, className, prefix = '$' }) {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        if (onChange) {
          onChange(values.value); // passes back the unformatted string representation of the number
        }
      }}
      thousandSeparator=","
      decimalScale={0}
      allowNegative={false}
      prefix={prefix}
      placeholder={placeholder}
      style={style}
      className={className}
    />
  );
}
