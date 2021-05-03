import {Grid, Card, CardHeader, CardContent, CardActions} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

import Pagination from './pagination'
import LinkButton from './linkbutton'
import Layout from './layout'
import Sidebar from './sidebar'

const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(1),
    }
}));

export default function PostList(props) {
    const classes = useStyles();
    return <Layout>
        <Grid item xs={12} md={8}>
            {props.posts.map(p => {
                return <Card key={p.id} className={classes.card}>
                    <CardHeader
                        title={p.title}
                        subheader={'Published: ' + p.date + ' Tags: ' + (p.tags || []).join(', ')}
                    />
                    <CardContent dangerouslySetInnerHTML={{ __html: p.excerpt }} />
                    <CardActions>
                        <LinkButton href={`/posts/${p.id}`}>More</LinkButton>
                    </CardActions>
                </Card>
            })}
            <Pagination count={props.pagesCount} page={props.pageNumber} pageURL={props.pageURL}/>
        </Grid>
        <Sidebar archives={props.archives} topics={props.topics}/>
    </Layout>
}
