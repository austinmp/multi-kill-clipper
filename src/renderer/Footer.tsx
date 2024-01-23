import React from 'react';
import Paper from '@mui/material/Paper';
import styles from './multi-kill-clipper.module.css';

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <Paper component="footer" className={className} elevation={10} square>
      <p className={styles.disclaimer}>
        Multi Kill Clipper isn't endorsed by Riot Games and doesn't reflect the
        views or opinions of Riot Games or anyone officially involved in
        producing or managing Riot Games properties. Riot Games, and all
        associated properties are trademarks or registered trademarks of Riot
        Games, Inc.
      </p>
    </Paper>
  );
}
