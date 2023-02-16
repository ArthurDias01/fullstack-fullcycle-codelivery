import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import DriveEtaIcon from '@mui/icons-material/DriveEta';

export const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <DriveEtaIcon />
          <Typography variant="h6" style={{ marginLeft: "8px" }}>Code Delivery</Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
