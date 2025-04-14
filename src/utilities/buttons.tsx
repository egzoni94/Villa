import { Button, ButtonProps } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const ButtonComponent = ({ children, ...props }: CustomButtonProps) => {
  return <Button {...props}>{children}</Button>;
};