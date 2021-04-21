import Link from 'next/link'
import {Grid, Paper, Typography} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  sidebarAboutBox: {
    padding: theme.spacing(2),
  },
  sidebarSection: {
    marginTop: theme.spacing(3),
  },
}));

export default function Sidebar({archives, topics}) {
    const classes = useStyles()
    return <Grid item xs={12} md={4}><Paper className={classes.sidebarAboutBox}>
        <Typography variant="h6" gutterBottom className={classes.sidebarSection}>Archives</Typography>
        <ul>
            {archives.map(a => <li key={a.url}>
                <Link href={a.url}>{a.title}</Link>
            </li>)}
        </ul>
        <Typography variant="h6" gutterBottom className={classes.sidebarSection}>Topics</Typography>
        <ul>
            {topics.map(a => <li key={a.url}>
                <Link href={a.url}>{a.title}</Link>
            </li>)}
        </ul>
    </Paper></Grid>
}
