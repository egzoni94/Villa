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

type BaseFieldConfig = {
  label?: string;
  options?: SelectOption[];
  props: Record<string, any>;
};

type InputFieldConfig = BaseFieldConfig & {
  type: "text" | "select" | "checkbox" | "button" | "description" | "title";
};

type GroupFieldConfig = {
  type: "group";
  fields: FieldConfig[];
};

type FieldConfig = InputFieldConfig | GroupFieldConfig;

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
    if (field.type === "group") {
      return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent:"space-between" }}>
          {field.fields.map((subField, idx) => (
            <div key={idx} style={{ maxWidth:"100px"}}>
              {renderComponent(subField)}
            </div>
          ))}
        </div>
      );
    }
  
    switch (field.type) {
      case "description":
        return (
          <div style={{ color: "gray", fontSize: "14px" }}>{field.label}</div>
        );
      case "title":
      return (
        <div
          style={{
            color: "gray",
            fontSize: "20px",
            textAlign: "center",
            padding: "8px",
          }}
        >
          {field.label}
        </div>
      );
      case "text":
        return (
          <TextField
            label={field.label}
            {...(field.props as TextFieldProps)}
            style={{ height: "20px" }}
            fullWidth
          />
        );
      case "select":
        return (
          <FormControl fullWidth style={{ height: "20px" }}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              {...(field.props as SelectProps)}
              onChange={(e) => {
                field.props?.onChange?.(e);
              }}
            >
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
              <Button
      {...(field.props as ButtonProps)}
      onClick={field.props?.onClick}
    >
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
        display:"flex",
        gap: "20px"

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
          style={{ marginBottom: "20px", width: "50%", maxWidth: "600px" }}
        >
          {renderComponent(field)}
        </div>
      ))}
    </div>
  );
};

export default ModalFormMain;
