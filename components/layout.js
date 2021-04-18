import {CssBaseline, Container, Grid} from '@material-ui/core'
import Header from './header'

export default function Layout({children, title, sections}) {
    return <>
        <CssBaseline />
        <Container maxWidth="md">
            <Header title={title} sections={sections}/>
            <Grid container spacing={5}>
                {children}
            </Grid>
        </Container>
    </>
}
