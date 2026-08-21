import React from 'react';
import Box from '@material-ui/core/Box';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Sidebar } from './components/Sidebar';
import { ServiceOfferingsPage } from './components/ServiceOfferingsPage';

const theme = createTheme({
  typography: {
    fontFamily: "'Lato', sans-serif",
  },
});

export default function App() {
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
          <ServiceOfferingsPage />
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
