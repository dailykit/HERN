import React from "react";
import {
  StyledInput,
  CheckboxContainer,
  HiddenCheckbox,
  StyledCheckbox,
  StyledTextArea,
  Icon,
} from "./styles";

const Checkbox = ({ className, checked, ...props }) => (
  <CheckboxContainer className={className}>
    <HiddenCheckbox checked={checked} {...props} />
    <StyledCheckbox checked={checked} {...props}>
      <Icon viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);

export default function Input({ className, children, ...props }) {
  switch (props.type) {
    case "checkbox":
      return <Checkbox className={className} {...props} />;
    case "textarea":
      return (
        <StyledTextArea className={className} {...props}>
          {children}
        </StyledTextArea>
      );
    default:
      return (
        <StyledInput className={className} {...props}>
          {children}
        </StyledInput>
      );
  }
}
