import Layout from '../../components/layout'
import Post from '../../components/post'
import {getAllPostIds, getPostData} from '../../lib/posts'


export default function Page(props) {
    return <Layout title={props.post.title}>
        <Post post={props.post}/>
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
    return {
        props: {
            post
        }
    }
}
