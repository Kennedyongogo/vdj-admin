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
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import MovieIcon from "@mui/icons-material/Movie";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://38.242.243.113:5035" : "";

const Mixes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mixes, setMixes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileType: "audio",
    duration: "",
    isPublic: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [currentMix, setCurrentMix] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMixes();
  }, []);

  const fetchMixes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/mix`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mixes");
      }

      const data = await response.json();
      setMixes(data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching mixes",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMix = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append file if selected
      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      // Append other form data
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/api/mix`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create mix");
      }

      // Show success alert
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Mix created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form and close dialog
      setOpenDialog(false);
      setSelectedFile(null);
      setFormData({
        title: "",
        description: "",
        fileType: "audio",
        duration: "",
        isPublic: true,
      });

      // Refresh the mixes list
      await fetchMixes();
    } catch (error) {
      // Show error alert
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

  const handlePlay = async (mix) => {
    try {
      const token = localStorage.getItem("token");
      // First, increment play count by fetching the specific mix
      await fetch(`${API_BASE_URL}/api/mix/${mix.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Then open the play modal
      setCurrentMix(mix);
      setPlayModalOpen(true);

      // Refresh the mixes list to update the play count
      await fetchMixes();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error playing mix",
        severity: "error",
      });
    }
  };

  const handleClosePlayModal = () => {
    setPlayModalOpen(false);
    setCurrentMix(null);
  };

  const handleEdit = (mix) => {
    setEditFormData({ ...mix });
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
        `${API_BASE_URL}/api/mix/${editFormData.id}`,
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
        throw new Error("Failed to update mix");
      }
      setSnackbar({ open: true, message: "Mix updated!", severity: "success" });
      setEditModalOpen(false);
      fetchMixes();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditFormData({});
  };

  const handleDeleteMix = async (id) => {
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
        const response = await fetch(`${API_BASE_URL}/api/mix/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete mix");
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your mix has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchMixes();
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

  const handleDownload = async (mix) => {
    try {
      const token = localStorage.getItem("token");
      // Trigger the file download
      const response = await fetch(
        `${API_BASE_URL}/api/mix/${mix.id}/download-file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Download failed");

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = mix.title || "mix"; // Use mix title as filename

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh the mixes list to update the download count
      await fetchMixes();
    } catch (error) {
      console.error("Error downloading file:", error);
      setSnackbar({
        open: true,
        message: "Error downloading file",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Automatically set fileType based on file extension
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let fileType = "audio";
      if (fileExtension === "mp4") {
        fileType = "mp4";
      } else if (["mp4", "mov", "avi"].includes(fileExtension)) {
        fileType = "video";
      }
      setFormData((prev) => ({ ...prev, fileType }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredMixes = mixes.filter((mix) => {
    if (activeTab === "all") return true;
    return mix.fileType === activeTab;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      fileType: "audio",
      duration: "",
      isPublic: true,
    });
    setSelectedFile(null);
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
            My Mixes
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
            Create New Mix
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
            aria-label="mix type tabs"
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AudiotrackIcon fontSize="small" />
                  All
                </Box>
              }
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AudiotrackIcon fontSize="small" />
                  Audio
                </Box>
              }
              value="audio"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MovieIcon fontSize="small" />
                  Video
                </Box>
              }
              value="video"
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MovieIcon fontSize="small" />
                  MP4
                </Box>
              }
              value="mp4"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredMixes.map((mix) => (
              <Grid item xs={12} sm={6} md={4} key={mix.id}>
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
                      justifyContent: "center",
                      alignItems: "center",
                      height: 140,
                      background: "#f5f5f5",
                    }}
                  >
                    {mix.fileType === "audio" ? (
                      <AudiotrackIcon sx={{ fontSize: 64, color: "#19bdb7" }} />
                    ) : (
                      <MovieIcon sx={{ fontSize: 64, color: "#1976d2" }} />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {mix.title}
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
                      {mix.description}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Duration: {Math.floor(mix.duration / 60)}:
                        {(mix.duration % 60).toString().padStart(2, "0")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Downloads: {mix.downloadCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Plays: {mix.playCount}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handlePlay(mix)}
                    >
                      <PlayIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownload(mix)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(mix)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMix(mix.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Mix Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Mix</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateMix} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
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

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>File Type</InputLabel>
                <Select
                  value={formData.fileType}
                  label="File Type"
                  onChange={(e) =>
                    setFormData({ ...formData, fileType: e.target.value })
                  }
                  required
                >
                  <MenuItem value="audio">Audio</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="mp4">MP4</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Duration (seconds)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <input
                  accept="audio/*,video/*"
                  style={{ display: "none" }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary">
                    Selected file: {selectedFile.name} (
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleCreateMix}
              variant="contained"
              disabled={loading || !selectedFile}
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

        {/* Play Modal */}
        <Dialog
          open={playModalOpen}
          onClose={handleClosePlayModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Play Mix
            <IconButton
              aria-label="close"
              onClick={handleClosePlayModal}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {currentMix && currentMix.fileType === "audio" && (
              <audio
                controls
                style={{ width: "100%" }}
                src={currentMix.fileUrl}
              />
            )}
            {currentMix &&
              (currentMix.fileType === "video" ||
                currentMix.fileType === "mp4") && (
                <video
                  controls
                  style={{ width: "100%" }}
                  src={currentMix.fileUrl}
                />
              )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={editModalOpen}
          onClose={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Mix
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
                label="Title"
                name="title"
                value={editFormData.title || ""}
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
                label="Duration (seconds)"
                name="duration"
                type="number"
                value={editFormData.duration || ""}
                onChange={handleEditChange}
                required
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

export default Mixes;
