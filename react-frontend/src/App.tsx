import { SnackbarProvider } from 'notistack'
import { Mapping } from './components/Mapping'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import './index.css'


function App() {


  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <Mapping />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
