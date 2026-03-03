/* eslint-disable react-hooks/exhaustive-deps */
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
  useTheme,
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
  const theme = useTheme();

  const logout = useAuthStore((s) => s.logout);

  const user = useAuthStore((state) => state.user);
  const connections = useConnectionStore((state) => state.connections);
  const selectedConnectionId = useConnectionStore(
    (state) => state.selectedConnectionId,
  );

  const setSelectedConnectionId = useConnectionStore(
    (state) => state.setSelectedConnectionId,
  );

  const subscribeConnection = useConnectionStore((state) => state.subscribe);
  const subscribeContact = useContactStore((state) => state.subscribe);
  const subscribeMessage = useMessageStore((state) => state.subscribe);

  const stopConnectionSubscribe = useConnectionStore(
    (state) => state.stopSubscribe,
  );
  const stopContactSubscribe = useContactStore((state) => state.stopSubscribe);
  const stopMessageSubscribe = useMessageStore((state) => state.stopSubscribe);

  const isConnectionContext =
    location.pathname === "/contacts" || location.pathname === "/messages";

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    subscribeConnection(user.uid);

    return stopConnectionSubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !selectedConnectionId) {
      return;
    }

    if (location.pathname === "/contacts") {
      subscribeContact(user.uid, selectedConnectionId);

      return stopContactSubscribe;
    }

    if (location.pathname === "/messages") {
      subscribeContact(user.uid, selectedConnectionId);
      subscribeMessage(user.uid, selectedConnectionId);

      return () => {
        stopContactSubscribe();
        stopMessageSubscribe();
      };
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
            Send Flow Unnichat - Broadcast
          </Typography>
          {isConnectionContext && (
            <FormControl
              size="small"
              sx={{ minWidth: 200, mr: 2 }}
              variant="outlined"
            >
              <InputLabel
                id="connection-select-label"
                sx={{ color: theme.palette.common.white }}
              >
                Conexão
              </InputLabel>
              <Select
                labelId="connection-select-label"
                value={selectedConnectionId ?? ""}
                onChange={(e) => handleConnectionChange(e.target.value)}
                label="Conexão"
                sx={{
                  color: theme.palette.common.white,
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.common.white,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.common.white,
                  },
                  ".MuiSelect-icon": {
                    color: theme.palette.common.white,
                  },
                }}
              >
                <MenuItem value="">Selecione uma conexão</MenuItem>
                {connections.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
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
