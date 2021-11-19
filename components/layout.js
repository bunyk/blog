import {CssBaseline, Container, Grid} from '@material-ui/core'

import Header from './header'
import Footer from './footer'


import {BLOG_TITLE} from '../constants'

export default function Layout({children, title}) {
    return <>
        <CssBaseline />
        <Container maxWidth="md">
            <Header title={title || BLOG_TITLE}/>
            <Grid container spacing={5}>
                {children}
                <Footer />
            </Grid>
        </Container>
    </>
}
