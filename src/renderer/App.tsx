import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import MultiKillClipper from './MultiKillClipper';

export default function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MultiKillClipper />} />
        </Routes>
      </Router>
    </>
  );
}
