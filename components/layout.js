import {CssBaseline, Container, Grid} from '@material-ui/core'
import Header from './header'

import Footer from './footer'


import {SECTIONS, BLOG_TITLE} from '../constants'

export default function Layout({children}) {
    return <>
        <CssBaseline />
        <Container maxWidth="md">
            <Header title={BLOG_TITLE} sections={SECTIONS}/>
            <Grid container spacing={5}>
                {children}
                <Footer />
            </Grid>
        </Container>
    </>
}
