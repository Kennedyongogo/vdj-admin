import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:5035" // Production API URL
    : ""; // Empty for development (will use relative paths)

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!adminResponse.ok) {
        const errorData = await adminResponse.json();
        throw new Error(errorData.message || "Login failed");
      }

      const adminData = await adminResponse.json();
      localStorage.setItem("token", adminData.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...adminData.data, isAdmin: true })
      );
      localStorage.setItem("loginType", "admin");

      setSnackbar({
        open: true,
        message: "Admin login successful! Redirecting to dashboard...",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || "An error occurred during login";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 3 },
          backgroundImage:
            'url("/Leonardo_Phoenix_10_A_vibrant_highenergy_illustration_of_a_sle_0.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "100%",
            height: isMobile ? "auto" : "75vh",
            maxHeight: "520px",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              flex: isMobile ? "none" : 1,
              bgcolor: "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              position: "relative",
              height: isMobile ? "140px" : "auto",
              minHeight: isMobile ? "140px" : "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minHeight: isMobile ? "140px" : "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            >
              <video
                src="/VID-20250529-WA0003.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </Box>
          </Box>

          {/* Login Form Section */}
          <Box
            sx={{
              flex: isMobile ? "none" : 1,
              display: "flex",
              flexDirection: "column",
              p: { xs: 2, md: 2.5 },
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "400px",
                mx: "auto",
                my: 0,
                py: 2,
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: { xs: "1.4rem", md: "1.8rem" },
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                }}
              >
                Welcome Back
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    style: {
                      background: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      borderRadius: 6,
                    },
                  }}
                  InputLabelProps={{
                    style: { color: "#fff" },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: {
                      background: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      borderRadius: 6,
                    },
                  }}
                  InputLabelProps={{
                    style: { color: "#fff" },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1,
                    mb: 2,
                    bgcolor: "#1976d2",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: "#115293",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;
