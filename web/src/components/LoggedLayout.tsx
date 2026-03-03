import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Link as LinkIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Contacts as ContactsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuthStore } from "../stores/authStore";
import { useConnectionStore } from "../stores/connectionStore";
import { useContactStore } from "../stores/contactStore";
import { useMessageStore } from "../stores/messageStore";

const DRAWER_WIDTH = 240;

const navItems = [
  { to: "/connections", label: "Conexões", icon: <LinkIcon /> },
  { to: "/contacts", label: "Contatos", icon: <ContactsIcon /> },
  { to: "/messages", label: "Mensagens", icon: <MessageIcon /> },
];

type LoggedLayoutProps = { children: React.ReactNode };

export const LoggedLayout = ({ children }: LoggedLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const connections = useConnectionStore((s) => s.connections);
  const selectedConnectionId = useConnectionStore(
    (s) => s.selectedConnectionId,
  );
  const setSelectedConnectionId = useConnectionStore(
    (s) => s.setSelectedConnectionId,
  );
  const stopContactSubscribe = useContactStore((s) => s.stopSubscribe);
  const stopMessageSubscribe = useMessageStore((s) => s.stopSubscribe);

  const isConnectionContext =
    location.pathname === "/contacts" || location.pathname === "/messages";

  useEffect(() => {
    if (!user?.uid) return;
    useConnectionStore.getState().subscribe(user.uid);
    return () => {
      useConnectionStore.getState().stopSubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !selectedConnectionId) return;
    if (location.pathname === "/contacts") {
      useContactStore.getState().subscribe(user.uid, selectedConnectionId);
      return () => useContactStore.getState().stopSubscribe();
    }
    if (location.pathname === "/messages") {
      useMessageStore.getState().subscribe(user.uid, selectedConnectionId);
      return () => useMessageStore.getState().stopSubscribe();
    }
  }, [user?.uid, selectedConnectionId, location.pathname]);

  const handleLogout = async () => {
    stopContactSubscribe();
    stopMessageSubscribe();
    await logout();
    navigate("/login");
  };

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnectionId(connectionId || null);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }} width="100vw">
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="span" sx={{ flexGrow: 1 }}>
            Broadcast
          </Typography>
          {isConnectionContext && (
            <FormControl
              size="small"
              sx={{ minWidth: 200, mr: 2 }}
              variant="outlined"
            >
              <InputLabel id="connection-select-label">Conexão</InputLabel>
              <Select
                labelId="connection-select-label"
                value={selectedConnectionId ?? ""}
                onChange={(e) => handleConnectionChange(e.target.value)}
                label="Conexão"
              >
                <MenuItem value="">Selecione uma conexão</MenuItem>
                {connections.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: 64,
            mt: 0,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", pt: 1 }}>
          <List>
            {navItems.map(({ to, label, icon }) => (
              <ListItemButton
                key={to}
                component={Link}
                to={to}
                selected={location.pathname === to}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
            <ListItemButton
              component={Link}
              to="/profile"
              selected={location.pathname === "/profile"}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Perfil" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 7,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
