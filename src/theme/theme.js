import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode: "Paper and Ink"
          primary: { main: '#3f51b5' }, // Crayon Blue
          background: { default: '#fdfbf7', paper: '#ffffff' }, // Creamy paper
          text: { primary: '#2d2d2d' },
        }
      : {
          // Dark Mode: "Chalkboard"
          primary: { main: '#ffcc80' }, // Chalk Orange
          background: { default: '#121212', paper: '#1e1e1e' },
          text: { primary: '#e0e0e0' },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Normal fonts as requested
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          borderRadius: '2px 8px 2px 8px / 8px 2px 8px 2px', // Slight subtle skew
          boxShadow: `2px 2px 0px 0px ${theme.palette.text.primary}`, // Hard shadow
          border: `2px solid ${theme.palette.text.primary}`,
          '&:hover': {
            boxShadow: `4px 4px 0px 0px ${theme.palette.text.primary}`,
            transform: 'translate(-1px, -1px)',
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none', // Remove default MUI dark mode gradient
        }),
      },
    },
  },
});

export default getTheme;