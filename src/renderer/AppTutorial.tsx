import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Paper from '@mui/material/Paper';
import Section from './common/Section';
import styles from './multi-kill-clipper.module.css';

export default function AppTutorial() {
  return (
    <Section>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h6">📌 Getting Started</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ol className={styles.customList}>
            <li className={styles.listItem}>
              You must have the League of Legends client installed on your
              computer and running while using the app.
            </li>
            <li className={styles.listItem}>
              By default the Replay API is disabled. To start using the Replay
              API, enable the Replay API in the game client config by locating
              where your game is installed and adding the following lines to the
              game.cfg file:
              <p>Example file location:</p>
              <code>C:\Riot Games\League of Legends\Config\game.cfg</code>
              <br />
              <br />
              <Paper elevation={5} className={styles.codeBlock}>
                <code>[General]</code>
                <br />
                <code>EnableReplayApi=1</code>
              </Paper>
              <br />
              <a href="https://developer.riotgames.com/docs/lol#game-client-api_replay-api">
                [Replay API Documentation]
              </a>
            </li>
          </ol>
        </AccordionDetails>
      </Accordion>
    </Section>
  );
}
