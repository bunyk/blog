import {Grid, Card, CardHeader, CardContent, CardActions} from '@material-ui/core'

import Pagination from './pagination'
import {POSTS_PER_PAGE} from '../constants'
import LinkButton from './linkbutton'

export default function PostList({posts, page, pages}) {
    return <Grid item xs={12} md={8}>
        {posts.map(p => {
            return <Card key={p.id}>
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
        <Pagination count={pages} page={page} />
    </Grid>
}
