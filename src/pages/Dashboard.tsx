import { Button, Typography, Box, Snackbar, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export const Dashboard = () => {
  const { logout } = useAuthStore();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Box
      p={4}
      width="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h4">Dashboard</Typography>
      <Box mt={2} display="flex" gap={2}>
        <Link to="/profile">
          <Button variant="outlined">Profile</Button>
        </Link>
        <Button variant="contained" onClick={logout}>
          Logout
        </Button>
      </Box>
      <Button variant="contained" onClick={handleOpen}>
        Mostrar Toast
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Operação realizada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
};
