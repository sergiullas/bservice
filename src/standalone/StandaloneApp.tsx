import React from 'react';
import Box from '@material-ui/core/Box';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Sidebar } from './Sidebar';
import { ServiceLogFeature } from '../app/ServiceLogFeature';
import { services } from './data/yamlAdapter';

const theme = createTheme({
  typography: {
    fontFamily: "'Lato', sans-serif",
  },
});

/**
 * Standalone stakeholder-demo host. Owns the theme, full-viewport shell, and
 * Sidebar — none of which the host-neutral ServiceLogFeature knows about.
 */
export default function StandaloneApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Box
      display="flex"
      height="100vh"
      style={{ backgroundColor: '#F2F2F2', overflow: 'hidden' }}
    >
      <Sidebar />
      <Box
        component="main"
        flex={1}
        style={{ overflow: 'auto', padding: 32 }}
      >
        <Box style={{ maxWidth: 1400, margin: '0 auto' }}>
          <ServiceLogFeature services={services} />
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
