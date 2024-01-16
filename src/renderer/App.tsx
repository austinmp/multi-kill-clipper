import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import MultiKillClipperWrapper from './MultiKillClipperWrapper';

export default function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MultiKillClipperWrapper />} />
        </Routes>
      </Router>
    </>
  );
}
