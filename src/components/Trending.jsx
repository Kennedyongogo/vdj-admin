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
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://38.242.243.113:5035" : "";

const Trending = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    contentType: "event",
    contentId: "",
    score: 0,
    viewCount: 0,
    engagementCount: 0,
    trendingPeriod: "daily",
    metadata: {},
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState([]);
  const [mixes, setMixes] = useState([]);

  useEffect(() => {
    fetchTrendingItems();
    fetchEvents();
    fetchMixes();
  }, []);

  const fetchTrendingItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/trending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trending items");
      }

      const data = await response.json();
      setTrendingItems(data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching trending items",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Error fetching events:", error);
    }
  };

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
      console.error("Error fetching mixes:", error);
    }
  };

  const handleCreateTrending = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/trending`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create trending entry");
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Trending entry created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setOpenDialog(false);
      setFormData({
        contentType: "event",
        contentId: "",
        score: 0,
        viewCount: 0,
        engagementCount: 0,
        trendingPeriod: "daily",
        metadata: {},
      });

      await fetchTrendingItems();
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

  const handleEdit = (item) => {
    setEditFormData({ ...item });
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
        `${API_BASE_URL}/api/trending/metrics/${editFormData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            viewCount: editFormData.viewCount,
            engagementCount: editFormData.engagementCount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update trending entry");
      }

      setSnackbar({
        open: true,
        message: "Trending entry updated successfully!",
        severity: "success",
      });
      setEditModalOpen(false);
      fetchTrendingItems();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error updating trending entry",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrending = async (id) => {
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
        const response = await fetch(`${API_BASE_URL}/api/trending/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete trending entry");
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Trending entry has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchTrendingItems();
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

  const filteredTrendingItems = trendingItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.contentType === activeTab;
  });

  const getContentDetails = (item) => {
    if (item.contentType === "event") {
      return events.find((event) => event.id === item.contentId);
    } else {
      return mixes.find((mix) => mix.id === item.contentId);
    }
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
            Trending Content
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
            Add Trending Content
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
            aria-label="trending content tabs"
          >
            <Tab label="All Content" value="all" />
            <Tab label="Events" value="event" />
            <Tab label="Mixes" value="mix" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTrendingItems.map((item) => {
              const content = getContentDetails(item);
              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                    {content?.bannerUrl ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={content.bannerUrl}
                        alt={content.title || content.name}
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
                        <TrendingUpIcon
                          sx={{ fontSize: 64, color: "#19bdb7" }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {content?.title || content?.name}
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
                        {content?.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" display="block">
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Score: {item.score.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Views: {item.viewCount}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Engagement: {item.engagementCount}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Period: {item.trendingPeriod}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTrending(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Create Trending Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Trending Content</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              onSubmit={handleCreateTrending}
              sx={{ mt: 2 }}
            >
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={formData.contentType}
                  label="Content Type"
                  onChange={(e) =>
                    setFormData({ ...formData, contentType: e.target.value })
                  }
                >
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="mix">Mix</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content</InputLabel>
                <Select
                  value={formData.contentId}
                  label="Content"
                  onChange={(e) =>
                    setFormData({ ...formData, contentId: e.target.value })
                  }
                >
                  {formData.contentType === "event"
                    ? events.map((event) => (
                        <MenuItem key={event.id} value={event.id}>
                          {event.name}
                        </MenuItem>
                      ))
                    : mixes.map((mix) => (
                        <MenuItem key={mix.id} value={mix.id}>
                          {mix.title}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="View Count"
                type="number"
                value={formData.viewCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    viewCount: parseInt(e.target.value),
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Engagement Count"
                type="number"
                value={formData.engagementCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engagementCount: parseInt(e.target.value),
                  })
                }
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Trending Period</InputLabel>
                <Select
                  value={formData.trendingPeriod}
                  label="Trending Period"
                  onChange={(e) =>
                    setFormData({ ...formData, trendingPeriod: e.target.value })
                  }
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTrending}
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
            Edit Trending Metrics
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
                label="View Count"
                type="number"
                name="viewCount"
                value={editFormData.viewCount || 0}
                onChange={handleEditChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Engagement Count"
                type="number"
                name="engagementCount"
                value={editFormData.engagementCount || 0}
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

export default Trending;
