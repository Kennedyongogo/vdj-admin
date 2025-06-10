import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://38.242.243.113:5035" : "";

const Events = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venue: "",
    venueAddress: "",
    startDate: "",
    endDate: "",
    ticketPrice: "",
    currency: "KES",
    isPublic: true,
    eventHosts: [],
    tags: [],
    socialLinks: {},
  });
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [newHost, setNewHost] = useState({ name: "", role: "", contact: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/event`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching events",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append banner if selected
      if (selectedBanner) {
        formDataToSend.append("banner", selectedBanner);
      }

      // Append other form data
      Object.keys(formData).forEach((key) => {
        if (key === "eventHosts" || key === "tags" || key === "socialLinks") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/event`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Event created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setOpenDialog(false);
      setSelectedBanner(null);
      setFormData({
        name: "",
        description: "",
        venue: "",
        venueAddress: "",
        startDate: "",
        endDate: "",
        ticketPrice: "",
        currency: "KES",
        isPublic: true,
        eventHosts: [],
        tags: [],
        socialLinks: {},
      });

      await fetchEvents();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonColor: "#19bdb7",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditFormData({ ...event });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append all form data
      Object.keys(editFormData).forEach((key) => {
        if (key === "eventHosts" || key === "tags" || key === "socialLinks") {
          formDataToSend.append(key, JSON.stringify(editFormData[key]));
        } else {
          formDataToSend.append(key, editFormData[key]);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/event/${editFormData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      setSnackbar({
        open: true,
        message: "Event updated successfully!",
        severity: "success",
      });
      setEditModalOpen(false);
      fetchEvents();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error updating event",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditFormData({});
  };

  const handleDeleteEvent = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#19bdb7",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/event/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your event has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchEvents();
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        confirmButtonColor: "#19bdb7",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true;
    return event.status === activeTab;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      venue: "",
      venueAddress: "",
      startDate: "",
      endDate: "",
      ticketPrice: "",
      currency: "KES",
      isPublic: true,
      eventHosts: [],
      tags: [],
      socialLinks: {},
    });
    setSelectedBanner(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddHost = () => {
    if (newHost.name && newHost.role) {
      setFormData((prev) => ({
        ...prev,
        eventHosts: [...prev.eventHosts, { ...newHost }],
      }));
      setNewHost({ name: "", role: "", contact: "" });
    }
  };

  const handleRemoveHost = (index) => {
    setFormData((prev) => ({
      ...prev,
      eventHosts: prev.eventHosts.filter((_, i) => i !== index),
    }));
  };

  const handleEditAddHost = () => {
    if (newHost.name && newHost.role) {
      setEditFormData((prev) => ({
        ...prev,
        eventHosts: [...(prev.eventHosts || []), { ...newHost }],
      }));
      setNewHost({ name: "", role: "", contact: "" });
    }
  };

  const handleEditRemoveHost = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      eventHosts: prev.eventHosts.filter((_, i) => i !== index),
    }));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        m: 1,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            My Events
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              bgcolor: "#19bdb7",
              "&:hover": {
                bgcolor: "#158a85",
              },
            }}
          >
            Create New Event
          </Button>
        </Box>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
            "& .MuiTabs-root": {
              minHeight: "48px",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: "48px",
              "&.Mui-selected": {
                color: "#19bdb7",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#19bdb7",
            },
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="event status tabs"
          >
            <Tab label="All Events" value="all" />
            <Tab label="Draft" value="draft" />
            <Tab label="Published" value="published" />
            <Tab label="Completed" value="completed" />
            <Tab label="Cancelled" value="cancelled" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  {event.bannerUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={
                        event.bannerUrl.startsWith("http")
                          ? event.bannerUrl
                          : `${API_BASE_URL}${event.bannerUrl}`
                      }
                      alt={event.name}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f5f5f5",
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: 64, color: "#19bdb7" }} />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {event.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.description}
                    </Typography>
                    {/* Event Hosts */}
                    {event.eventHosts && event.eventHosts.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Hosts:
                        </Typography>
                        {event.eventHosts.map((host, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            color="text.secondary"
                          >
                            {host.name} {host.role && `- ${host.role}`}{" "}
                            {host.contact && `(${host.contact})`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block">
                        <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {event.venue}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {formatDate(event.startDate)}
                      </Typography>
                      {event.ticketPrice && (
                        <Typography variant="caption" display="block">
                          <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {event.currency} {event.ticketPrice}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(event)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Event Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Event</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateEvent} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Venue"
                name="venue"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Venue Address"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={(e) =>
                  setFormData({ ...formData, venueAddress: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ticket Price"
                name="ticketPrice"
                type="number"
                value={formData.ticketPrice}
                onChange={(e) =>
                  setFormData({ ...formData, ticketPrice: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  label="Currency"
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  <MenuItem value="KES">KES</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Event Hosts
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    label="Host Name"
                    value={newHost.name}
                    onChange={(e) =>
                      setNewHost((prev) => ({ ...prev, name: e.target.value }))
                    }
                    size="small"
                  />
                  <TextField
                    label="Role"
                    value={newHost.role}
                    onChange={(e) =>
                      setNewHost((prev) => ({ ...prev, role: e.target.value }))
                    }
                    size="small"
                  />
                  <TextField
                    label="Contact"
                    value={newHost.contact}
                    onChange={(e) =>
                      setNewHost((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddHost}
                    sx={{
                      bgcolor: "#19bdb7",
                      "&:hover": { bgcolor: "#158a85" },
                    }}
                  >
                    Add Host
                  </Button>
                </Box>
                {formData.eventHosts.map((host, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {host.name} - {host.role}{" "}
                      {host.contact && `(${host.contact})`}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveHost(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="banner-upload"
                  type="file"
                  onChange={(e) => setSelectedBanner(e.target.files[0])}
                />
                <label htmlFor="banner-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {selectedBanner ? selectedBanner.name : "Upload Banner"}
                  </Button>
                </label>
                {selectedBanner && (
                  <Typography variant="caption" color="text.secondary">
                    Selected file: {selectedBanner.name} (
                    {(selectedBanner.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleCreateEvent}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#19bdb7",
                "&:hover": {
                  bgcolor: "#158a85",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={editModalOpen}
          onClose={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Event
            <IconButton
              aria-label="close"
              onClick={handleCloseEditModal}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={editFormData.name || ""}
                onChange={handleEditChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Venue"
                name="venue"
                value={editFormData.venue || ""}
                onChange={handleEditChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Venue Address"
                name="venueAddress"
                value={editFormData.venueAddress || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="datetime-local"
                value={
                  editFormData.startDate
                    ? editFormData.startDate.slice(0, 16)
                    : ""
                }
                onChange={handleEditChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="datetime-local"
                value={
                  editFormData.endDate ? editFormData.endDate.slice(0, 16) : ""
                }
                onChange={handleEditChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ticket Price"
                name="ticketPrice"
                type="number"
                value={editFormData.ticketPrice || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={editFormData.currency || "KES"}
                  label="Currency"
                  name="currency"
                  onChange={handleEditChange}
                >
                  <MenuItem value="KES">KES</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status || "draft"}
                  label="Status"
                  name="status"
                  onChange={handleEditChange}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Event Hosts
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    label="Host Name"
                    value={newHost.name}
                    onChange={(e) =>
                      setNewHost((prev) => ({ ...prev, name: e.target.value }))
                    }
                    size="small"
                  />
                  <TextField
                    label="Role"
                    value={newHost.role}
                    onChange={(e) =>
                      setNewHost((prev) => ({ ...prev, role: e.target.value }))
                    }
                    size="small"
                  />
                  <TextField
                    label="Contact"
                    value={newHost.contact}
                    onChange={(e) =>
                      setNewHost((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleEditAddHost}
                    sx={{
                      bgcolor: "#19bdb7",
                      "&:hover": { bgcolor: "#158a85" },
                    }}
                  >
                    Add Host
                  </Button>
                </Box>
                {editFormData.eventHosts?.map((host, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {host.name} - {host.role}{" "}
                      {host.contact && `(${host.contact})`}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleEditRemoveHost(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="banner-upload"
                  type="file"
                  onChange={(e) => setSelectedBanner(e.target.files[0])}
                />
                <label htmlFor="banner-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {selectedBanner ? selectedBanner.name : "Upload Banner"}
                  </Button>
                </label>
                {selectedBanner && (
                  <Typography variant="caption" color="text.secondary">
                    Selected file: {selectedBanner.name} (
                    {(selectedBanner.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ bgcolor: "#19bdb7", "&:hover": { bgcolor: "#158a85" } }}
              >
                {loading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

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

export default Events;
