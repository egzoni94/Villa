import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalForm from "../utilities/modalForm";
import { handlePost } from "../utilities/handleApiCalls";
import { Container, FormControlLabel, Switch, Typography } from "@mui/material";
import "../index.css";
import { useTheme } from "../utilities/theme";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      navigate("/home");
    }
  }, []);

  const handleLogin = async () => {
    if (username && password) {
      const url = "api/Login";
      const params = `?username=${username}&password=${password}`;
      const response = await handlePost(url + params);
      if (response.isSuccessfull) {
        localStorage.setItem("access_token", response.data);
        navigate("/home");
      }
    } else {
      alert("Invalid credentials!");
    }
  };

  const fieldConfig = [
    {
      type: "text" as const, // Type assertion to ensure it matches the expected type
      label: "Username",
      props: {
        value: username,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value),
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
        autofill:false,
      },
    },
    {
      type: "text" as const, // Type assertion to ensure it matches the expected type
      label: "Password",
      props: {
        value: password,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value),
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
        type: "password",
      },
    },
    {
      type: "button" as const, // Type assertion to ensure it matches the expected type
      label: "Login",
      props: {
        variant: "contained",
        color: "primary",
      },
    },
  ];

  return (
    <div className="main_container">
      <div className="dark_theme_container">
        {/* <h6>{theme === "light" ? "Light Mode" : "Dark Mode"}</h6> */}
        <FormControlLabel
          control={<Switch checked={theme === "dark"} onChange={toggleTheme} />}
          label={theme === "light" ? "Switch to Dark" : "Switch to Light"}
        />
      </div>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <ModalForm fieldConfig={fieldConfig} onSubmit={() => handleLogin()} />
      </Container>
    </div>
  );
};

export default LoginPage;
