import Head from 'next/head'
import Link from 'next/link'
import {Toolbar, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: 'space-between',
    overflowX: 'auto',
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
}));

export default function Header({title, sections}) {
    const classes = useStyles();
    return <>
        <Head>
            <title>{title}</title>
        </Head>
        <Toolbar className={classes.toolbar}>
            <Typography
                component="h1"
                variant="h5"
                aligh="center"
                className={classes.toolbarTitle}
                noWrap
            >{title}</Typography>
        </Toolbar>
        <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
            {sections.map((section) => {
                return <Link href={section.url} className={classes.toolbarLink} key={section.url} passHref>
                    {section.title}
                </Link>
            })}
        </Toolbar>
    </>
}
