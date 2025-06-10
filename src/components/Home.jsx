import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "http://38.242.243.113:5035" : "";

const Home = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [mixStats, setMixStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mixLoading, setMixLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedMixYear, setSelectedMixYear] = useState("all");
  const [selectedMixMonth, setSelectedMixMonth] = useState("all");

  // Generate array of years (2020 to 2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  // Array of all months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchStats();
    fetchMixStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/event/stats/charts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMixStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/mix/stats/charts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mix statistics");
      }

      const data = await response.json();
      setMixStats(data.data);
    } catch (error) {
      console.error("Error fetching mix statistics:", error);
    } finally {
      setMixLoading(false);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleMixYearChange = (event) => {
    setSelectedMixYear(event.target.value);
  };

  const handleMixMonthChange = (event) => {
    setSelectedMixMonth(event.target.value);
  };

  const filteredMonthlyData = stats?.chartData.monthlyBarChart.filter(
    (item) => {
      if (selectedYear === "all" && selectedMonth === "all") return true;
      if (selectedYear === "all") return item.month === selectedMonth;
      if (selectedMonth === "all")
        return String(item.year) === String(selectedYear);
      return (
        String(item.year) === String(selectedYear) &&
        item.month === selectedMonth
      );
    }
  );

  const monthlyBarData = {
    labels: filteredMonthlyData?.map((item) => item.label) || [],
    datasets: [
      {
        label: "Number of Events",
        data: filteredMonthlyData?.map((item) => item.value) || [],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography variant="h6" color="error" align="center">
        Failed to load statistics
      </Typography>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Event Statistics",
      },
    },
  };

  const statusPieData = {
    labels: stats.chartData.statusPieChart.map((item) => item.label),
    datasets: [
      {
        data: stats.chartData.statusPieChart.map((item) => item.value),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const venueBarData = {
    labels: stats.chartData.venueBarChart.map((item) => item.label),
    datasets: [
      {
        label: "Events per Venue",
        data: stats.chartData.venueBarChart.map((item) => item.value),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  const publicPrivatePieData = {
    labels: stats.chartData.publicPrivatePieChart.map((item) => item.label),
    datasets: [
      {
        data: stats.chartData.publicPrivatePieChart.map((item) => item.value),
        backgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const ticketPriceBarData = {
    labels: stats.chartData.ticketPriceBarChart.map((item) => item.label),
    datasets: [
      {
        label: "Average Ticket Price",
        data: stats.chartData.ticketPriceBarChart.map((item) => item.value),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const filteredMixMonthlyData = mixStats?.chartData.monthlyBarChart.filter(
    (item) => {
      if (selectedMixYear === "all" && selectedMixMonth === "all") return true;
      if (selectedMixYear === "all") return item.month === selectedMixMonth;
      if (selectedMixMonth === "all")
        return String(item.year) === String(selectedMixYear);
      return (
        String(item.year) === String(selectedMixYear) &&
        item.month === selectedMixMonth
      );
    }
  );

  const mixFileTypePieData = mixStats && {
    labels: mixStats.chartData.fileTypePieChart.map((item) => item.label),
    datasets: [
      {
        data: mixStats.chartData.fileTypePieChart.map((item) => item.value),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const mixPublicPrivatePieData = mixStats && {
    labels: mixStats.chartData.publicPrivatePieChart.map((item) => item.label),
    datasets: [
      {
        data: mixStats.chartData.publicPrivatePieChart.map(
          (item) => item.value
        ),
        backgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const mixMonthlyBarData = {
    labels: filteredMixMonthlyData?.map((item) => item.label) || [],
    datasets: [
      {
        label: "Number of Mixes",
        data: filteredMixMonthlyData?.map((item) => item.value) || [],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const mixDownloadedBarData = mixStats && {
    labels: mixStats.chartData.downloadedMixesBarChart.map(
      (item) => item.label
    ),
    datasets: [
      {
        label: "Downloads",
        data: mixStats.chartData.downloadedMixesBarChart.map(
          (item) => item.value
        ),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  const mixPlayedBarData = mixStats && {
    labels: mixStats.chartData.playedMixesBarChart.map((item) => item.label),
    datasets: [
      {
        label: "Plays",
        data: mixStats.chartData.playedMixesBarChart.map((item) => item.value),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const mixFileSizeBarData = mixStats && {
    labels: mixStats.chartData.fileSizeBarChart.map((item) => item.label),
    datasets: [
      {
        label: "Average File Size (bytes)",
        data: mixStats.chartData.fileSizeBarChart.map((item) => item.value),
        backgroundColor: "#4BC0C0",
      },
    ],
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
          Dashboard
        </Typography>

        {/* Summary Cards - Moved to top */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.primary.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Total Events</Typography>
              <Typography variant="h4">{stats.rawStats.totalEvents}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.success.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Published Events</Typography>
              <Typography variant="h4">
                {stats.rawStats.statusDistribution.published}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.warning.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Public Events</Typography>
              <Typography variant="h4">
                {stats.rawStats.publicPrivateDistribution.public}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.error.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Private Events</Typography>
              <Typography variant="h4">
                {stats.rawStats.publicPrivateDistribution.private}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Event Status Distribution
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Pie data={statusPieData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Events */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Events by Month
              </Typography>
              <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={handleYearChange}
                  >
                    <MenuItem value="all">All Years</MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Month"
                    onChange={handleMonthChange}
                  >
                    <MenuItem value="all">All Months</MenuItem>
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Bar data={monthlyBarData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Venue Distribution */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Events by Venue
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Bar data={venueBarData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Public vs Private */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Public vs Private Events
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Pie data={publicPrivatePieData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Ticket Price */}
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Average Ticket Price by Status
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Bar data={ticketPriceBarData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Mixes Section */}
        <Typography variant="h5" sx={{ mb: 3, mt: 6 }}>
          Mixes Statistics
        </Typography>

        {/* Mix Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.primary.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Total Mixes</Typography>
              <Typography variant="h4">
                {mixStats?.rawStats.totalMixes || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.success.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Total Storage Used</Typography>
              <Typography variant="h4">
                {(mixStats?.rawStats.totalStorageUsed / (1024 * 1024)).toFixed(
                  2
                )}{" "}
                MB
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.warning.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Public Mixes</Typography>
              <Typography variant="h4">
                {mixStats?.rawStats.publicPrivateDistribution.public || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.error.main,
                color: "white",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="h6">Private Mixes</Typography>
              <Typography variant="h4">
                {mixStats?.rawStats.publicPrivateDistribution.private || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* File Type Distribution */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mix Type Distribution
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                {mixStats && (
                  <Pie data={mixFileTypePieData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Mixes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mixes by Month
              </Typography>
              <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedMixYear}
                    label="Year"
                    onChange={handleMixYearChange}
                  >
                    <MenuItem value="all">All Years</MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMixMonth}
                    label="Month"
                    onChange={handleMixMonthChange}
                  >
                    <MenuItem value="all">All Months</MenuItem>
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Bar data={mixMonthlyBarData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Most Downloaded Mixes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Most Downloaded Mixes
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                {mixStats && (
                  <Bar data={mixDownloadedBarData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Most Played Mixes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Most Played Mixes
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                {mixStats && (
                  <Bar data={mixPlayedBarData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Public vs Private Mixes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Public vs Private Mixes
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                {mixStats && (
                  <Pie data={mixPublicPrivatePieData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Average File Size */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Average File Size by Type
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                {mixStats && (
                  <Bar data={mixFileSizeBarData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

export default Home;
