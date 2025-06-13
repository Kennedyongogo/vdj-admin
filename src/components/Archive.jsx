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
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://38.242.243.113:5035" : "";

const Archive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    venue: "",
    location: "",
    description: "",
    setlist: "",
    genre: "",
    attendance: "",
    isPublic: true,
  });
  const [selectedFiles, setSelectedFiles] = useState({
    videos: [],
    images: [],
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [mediaModal, setMediaModal] = useState({
    open: false,
    type: null,
    src: null,
  });

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/archive`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch archives");
      }

      const data = await response.json();
      setArchives(data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching archives",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArchive = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append files
      selectedFiles.videos.forEach((file) => {
        formDataToSend.append("videos", file);
      });
      selectedFiles.images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Append other form data
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/api/archive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create archive");
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Archive entry created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setOpenDialog(false);
      setSelectedFiles({ videos: [], images: [] });
      setFormData({
        eventName: "",
        eventDate: "",
        venue: "",
        location: "",
        description: "",
        setlist: "",
        genre: "",
        attendance: "",
        isPublic: true,
      });

      await fetchArchives();
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

  const handleEdit = (archive) => {
    setEditFormData({ ...archive });
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
      const response = await fetch(
        `${API_BASE_URL}/api/archive/${editFormData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update archive");
      }
      setSnackbar({
        open: true,
        message: "Archive updated!",
        severity: "success",
      });
      setEditModalOpen(false);
      fetchArchives();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArchive = async (id) => {
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
        const response = await fetch(`${API_BASE_URL}/api/archive/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete archive");
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your archive entry has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchArchives();
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

  const handleFileChange = (event, type) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files],
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      eventDate: "",
      venue: "",
      location: "",
      description: "",
      setlist: "",
      genre: "",
      attendance: "",
      isPublic: true,
    });
    setSelectedFiles({ videos: [], images: [] });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
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
            Event Archives
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
            Add New Event
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {archives.map((archive) => (
              <Grid item xs={12} sm={6} md={4} key={archive.id}>
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      overflowX: "auto",
                      height: 140,
                      background: "#f5f5f5",
                      gap: 1,
                      p: 1,
                    }}
                  >
                    {/* Images Gallery */}
                    {archive.images &&
                      archive.images.map((img, idx) => (
                        <Box
                          key={img}
                          sx={{
                            minWidth: 120,
                            maxWidth: 140,
                            height: 120,
                            position: "relative",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setMediaModal({
                              open: true,
                              type: "image",
                              src: `${API_BASE_URL}${img}`,
                            })
                          }
                        >
                          <CardMedia
                            component="img"
                            image={`${API_BASE_URL}${img}`}
                            alt={archive.eventName + " image " + (idx + 1)}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      ))}
                    {/* Videos Gallery */}
                    {archive.videos &&
                      archive.videos.map((vid, idx) => (
                        <Box
                          key={vid}
                          sx={{
                            minWidth: 120,
                            maxWidth: 140,
                            height: 120,
                            position: "relative",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setMediaModal({
                              open: true,
                              type: "video",
                              src: `${API_BASE_URL}${vid}`,
                            })
                          }
                        >
                          <CardMedia
                            component="video"
                            src={`${API_BASE_URL}${vid}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                            controls={false}
                            muted
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: "none",
                            }}
                          >
                            <PlayIcon
                              sx={{ fontSize: 32, color: "#fff", opacity: 0.8 }}
                            />
                          </Box>
                        </Box>
                      ))}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {archive.eventName}
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
                      {archive.description}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Venue: {archive.venue}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Date: {new Date(archive.eventDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Location: {archive.location}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(archive)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteArchive(archive.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Archive Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Event Archive</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateArchive} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Event Name"
                name="eventName"
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Event Date"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                required
                InputLabelProps={{ shrink: true }}
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
                label="Location"
                name="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
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
                label="Setlist"
                name="setlist"
                value={formData.setlist}
                onChange={(e) =>
                  setFormData({ ...formData, setlist: e.target.value })
                }
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Genre"
                name="genre"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Attendance"
                name="attendance"
                type="number"
                value={formData.attendance}
                onChange={(e) =>
                  setFormData({ ...formData, attendance: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <input
                  accept="video/*"
                  style={{ display: "none" }}
                  id="video-upload"
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "videos")}
                />
                <label htmlFor="video-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<VideoIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload Videos
                  </Button>
                </label>
                {selectedFiles.videos.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Selected videos: {selectedFiles.videos.length}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "images")}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<ImageIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload Images
                  </Button>
                </label>
                {selectedFiles.images.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Selected images: {selectedFiles.images.length}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleCreateArchive}
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
          onClose={() => setEditModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Archive Entry
            <IconButton
              aria-label="close"
              onClick={() => setEditModalOpen(false)}
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
                name="eventName"
                value={editFormData.eventName || ""}
                onChange={handleEditChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Event Date"
                name="eventDate"
                type="date"
                value={
                  editFormData.eventDate
                    ? new Date(editFormData.eventDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleEditChange}
                required
                InputLabelProps={{ shrink: true }}
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
                label="Location"
                name="location"
                value={editFormData.location || ""}
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
                label="Setlist"
                name="setlist"
                value={editFormData.setlist || ""}
                onChange={handleEditChange}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Genre"
                name="genre"
                value={editFormData.genre || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Attendance"
                name="attendance"
                type="number"
                value={editFormData.attendance || ""}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
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

        {/* Media Modal */}
        <Dialog
          open={mediaModal.open}
          onClose={() => setMediaModal({ open: false, type: null, src: null })}
          maxWidth="md"
        >
          <DialogContent sx={{ p: 0, background: "#000" }}>
            {mediaModal.type === "image" ? (
              <img
                src={mediaModal.src}
                alt="Event Media"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  display: "block",
                  margin: "auto",
                }}
              />
            ) : mediaModal.type === "video" ? (
              <video
                src={mediaModal.src}
                controls
                autoPlay
                style={{
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  display: "block",
                  margin: "auto",
                }}
              />
            ) : null}
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

export default Archive;
