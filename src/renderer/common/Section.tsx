import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import styles from '../multi-kill-clipper.module.css';

/* A simple wrapper around each of the main sections of the app (table, search form, controls)
which serves to unify the visual appearance.
*/
export default function Section({ children }) {
  return (
    <Box component="div">
      <Paper elevation={4} square={false} className={styles.section}>
        {children}
      </Paper>
    </Box>
  );
}
