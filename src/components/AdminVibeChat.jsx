import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:5035"
    : "http://localhost:3003";

const WS_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "ws://38.242.243.113:5035"
    : "ws://localhost:3003";

const AdminVibeChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const messagesEndRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/message`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching messages",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Setup WebSocket connection
    const ws = new WebSocket(`${WS_BASE_URL}/ws/chat`);
    ws.onopen = () => {
      console.log("Connected to chat server (admin)");
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
      console.log("Disconnected from chat server");
    };
    setSocket(ws);
    return () => {
      ws.close();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN)
      return;
    const token = localStorage.getItem("token");
    const message = {
      text: newMessage,
      timestamp: new Date().toISOString(),
      token, // send JWT token for admin
    };
    socket.send(JSON.stringify(message));
    setNewMessage("");
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Paper elevation={3} sx={{ m: 1, borderRadius: 2, overflow: "hidden" }}>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Vibe Chat Room
          </Typography>
          <Button
            variant="contained"
            onClick={fetchMessages}
            sx={{ bgcolor: "#19bdb7", "&:hover": { bgcolor: "#158a85" } }}
          >
            Refresh
          </Button>
        </Box>
        <Box
          sx={{
            bgcolor: "rgba(0,0,0,0.85)",
            borderRadius: 2,
            p: 2,
            minHeight: 400,
            maxHeight: 600,
            overflowY: "auto",
            mb: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
            >
              {messages.map((msg, idx) => (
                <ListItem
                  key={msg.id || idx}
                  sx={{
                    alignSelf:
                      msg.sender === "support" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor:
                        msg.sender === "support" ? "primary.main" : "grey.800",
                      color: msg.sender === "support" ? "#fff" : "#fff",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                    >
                      {msg.sender === "support" ? "Admin" : "User"} |{" "}
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: "flex",
            gap: 1,
            borderTop: "1px solid #eee",
            p: 1,
            bgcolor: "rgba(0,0,0,0.85)",
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            disabled={loading}
          >
            Send
          </Button>
        </Box>
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
      </Container>
    </Paper>
  );
};

export default AdminVibeChat;
