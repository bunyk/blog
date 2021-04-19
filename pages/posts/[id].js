import Footer from '../../components/footer'
import Header from '../../components/header'
import Layout from '../../components/layout'
import Post from '../../components/post'
import Sidebar from '../../components/sidebar'
import {getAllPostIds, getPostData} from '../../lib/posts'
import {POSTS_PER_PAGE, SECTIONS} from '../../constants'


export default function Page({post}) {
    return <Layout title={post.title} sections={SECTIONS}>
        <Post post={post}/>
        <Sidebar />
        <Footer />
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
