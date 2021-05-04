import {Grid, Card, CardHeader, CardContent} from '@material-ui/core'


export default function PostList({post}) {
    return <Grid item xs={12} md={9}>
        <Card>
            <CardHeader
                title={post.title}
                subheader={'Published: ' + post.date + ' Tags: ' + (post.tags || []).join(', ')}
            />
            <CardContent dangerouslySetInnerHTML={{ __html: post.content }} />
        </Card>
    </Grid>
}
