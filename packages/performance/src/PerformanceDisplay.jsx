import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

const PerformanceDisplay = ({ tracker }) => {
    const [metrics, setMetrics] = useState(tracker.getMetrics());
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        return tracker.subscribe(newMetrics => {
            setMetrics(newMetrics);
        });
    }, [tracker]);

    const handleExport = () => {
        const data = tracker.exportMetrics();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metrics.appName}-performance-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: expanded ? 600 : 200,
                p: 2,
                zIndex: 1000,
                transition: 'width 0.3s ease-in-out',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Performance Metrics</Typography>
                <Box>
                    <IconButton size="small" onClick={handleExport} sx={{ color: 'white', mr: 1 }}>
                        <DownloadIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Box>
                <Typography>FPS: {metrics.currentMetrics.fps}</Typography>
                <Typography>Memory: {Math.round(metrics.currentMetrics.memory)}MB</Typography>
                {expanded && (
                    <TableContainer component={Box} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Metric</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>State Updates</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.stateUpdatesCount}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Renders</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.rendersCount}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Long Tasks</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.longTasksCount}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Avg State Update Time</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.averageStateUpdateTime.toFixed(2)}ms
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Avg Render Time</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.averageRenderTime.toFixed(2)}ms
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Avg Interaction Time</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {metrics.currentMetrics.averageInteractionTime.toFixed(2)}ms
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Uptime</TableCell>
                                    <TableCell align="right" sx={{ color: 'white' }}>
                                        {(metrics.uptime / 1000).toFixed(1)}s
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Paper>
    );
};

export default PerformanceDisplay;
