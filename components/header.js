import Head from 'next/head'
import Link from 'next/link'
import {Toolbar, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import {SECTIONS, BLOG_TITLE} from '../constants'

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

export default function Header({title}) {
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
            >{BLOG_TITLE}</Typography>
        </Toolbar>
        <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
            {SECTIONS.map((section) => {
                return <Link href={section.url} className={classes.toolbarLink} key={section.url} passHref>
                    {section.title}
                </Link>
            })}
        </Toolbar>
    </>
}
