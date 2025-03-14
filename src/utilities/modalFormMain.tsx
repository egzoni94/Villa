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

interface ModalFormMainProps {
  fieldConfig: FieldConfig[]; // fieldConfig should be an array of FieldConfig
  zIndex?: number;
  theme?: "light" | "dark"; // Explicitly define theme type
  onSubmit?: () => void; // Optional submit function
  onClose?: () => void; // Optional close handler for modal
}

const ModalFormMain: React.FC<ModalFormMainProps> = ({
  fieldConfig,
  onSubmit,
  zIndex = 10, // Default zIndex if not provided
  theme = "light", // Default to 'light' theme
  onClose,
}) => {
  // Renders individual field based on the type
  const renderComponent = (field: FieldConfig) => {
    switch (field.type) {
      case "text":
        return (
          <TextField
            label={field.label}
            {...(field.props as TextFieldProps)}
            fullWidth
          />
        );
      case "select":
        return (
          <FormControl {...field.props.formControlProps} fullWidth>
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
    <div
      className="modalFormMainContainer"
      style={{
        zIndex,
        background: theme === "light" ? "#fff" : "#121212", // Darker background for dark mode
        color: theme === "light" ? "#000" : "#fff", // Ensure text is readable
      }}
    >
      {/* Optional Close Button */}
      {onClose && (
        <button
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            height: "25px",
            width: "25px",
            fontSize: "14px",
            borderRadius: "5px",
            background: theme === "dark" ? "#fff" : "#121212",
            color: theme === "dark" ? "#121212" : "#fff",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          X
        </button>
      )}

      {/* Render the form fields */}
      {fieldConfig.map((field, index) => (
        <div
          key={index}
          style={{ marginBottom: "16px", width: "50%", maxWidth: "350px" }}
        >
          {renderComponent(field)}
        </div>
      ))}
    </div>
  );
};

export default ModalFormMain;
