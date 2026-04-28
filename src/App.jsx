import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import FlightManagement from './components/FlightManagement'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0052cc',
    },
    background: {
      default: '#f4f5f7',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FlightManagement />
    </ThemeProvider>
  )
}

export default App
