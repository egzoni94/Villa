import React from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ButtonProps,
  TextFieldProps,
  SelectProps,
  CheckboxProps,
} from "@mui/material";

type SelectOption = {
  value: string | number;
  label: string;
};

type FieldConfig = {
  type: "text" | "select" | "checkbox" | "button"; // Added 'button' type
  label?: string;
  options?: SelectOption[]; // For 'select' type only
  props: Record<string, any>; // Generic props to be passed to components
};

interface ModalFormProps {
  fieldConfig: FieldConfig[]; // fieldConfig should be an array of FieldConfig
  onSubmit?: () => void; // Optional submit function
}

const ModalForm: React.FC<ModalFormProps> = ({
  fieldConfig,
  onSubmit,
}) => {
  const renderComponent = (field: FieldConfig) => {
    switch (field.type) {
      case "text":
        return (
          <TextField label={field.label} {...(field.props as TextFieldProps)} />
        );
      case "select":
        return (
          <FormControl {...field.props.formControlProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select {...(field.props.selectProps as SelectProps)}>
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControlLabel
            control={<Checkbox {...(field.props as CheckboxProps)} />}
            label={field.label}
          />
        );
      case "button":
        return (
          <Button {...(field.props as ButtonProps)} onClick={onSubmit}>
            {field.label}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {fieldConfig.map((field, index) => (
        <div key={index}>{renderComponent(field)}</div>
      ))}
    </div>
  );
};

export default ModalForm;
