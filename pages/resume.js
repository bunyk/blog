import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import {Grid} from '@material-ui/core'
import {getPostsArchives, getPostsTopics} from '../lib/posts'


export default function ResumePage(props) {
    return <Layout title="Resume">
        <Grid item xs={12} md={9}>
		    <embed
                type="application/pdf"
                src="content/resume.pdf"
                style={{
                    width: '100%',
                    'min-height': '900px',
                }}
            />
        </Grid>
        <Sidebar archives={props.archives} topics={props.topics}/>
    </Layout>
}


export async function getStaticProps({params}) {
    const archives = await getPostsArchives();
    const topics = await getPostsTopics();
    return {
        props: {
            archives, topics
        }
    }
}
