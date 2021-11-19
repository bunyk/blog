import {Grid} from '@material-ui/core'
import Link from 'next/link'

import Layout from './layout'

export default function PostList(props) {
    return <Layout>
        <Grid item xs={12} md={9}>
			<ul>
            {props.posts.map(p => {
                return <li key={p.id}>
					<Link href={`/posts/${p.id}`}>{p.title}</Link> 
                    <span> ({[p.date].concat(p.tags || []).join(', ')})</span>
                </li>
            })}
			</ul>
        </Grid>
    </Layout>
}
