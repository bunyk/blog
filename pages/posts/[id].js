import Layout from '../../components/layout'
import Post from '../../components/post'
import Sidebar from '../../components/sidebar'
import {getAllPostIds, getPostData, getPostsArchives, getPostsTopics} from '../../lib/posts'


export default function Page(props) {
    return <Layout title={props.post.title}>
        <Post post={props.post}/>
        <Sidebar archives={props.archives} topics={props.topics}/>
    </Layout>
}

export async function getStaticPaths() {
    const ids = getAllPostIds()
    return {
        paths: ids.map(id => ({
            params: {id}
        })),
        fallback: false
    }
}

export async function getStaticProps({ params }) {
    const post = await getPostData(params.id)
    const archives = await getPostsArchives();
    const topics = await getPostsTopics();
    return {
        props: {
            post, archives, topics
        }
    }
}
