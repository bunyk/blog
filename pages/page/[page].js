import Footer from '../../components/footer'
import Header from '../../components/header'
import Layout from '../../components/layout'
import PostList from '../../components/postlist'
import Sidebar from '../../components/sidebar'
import {getAllPostIds, getSortedPostsData} from '../../lib/posts'
import {POSTS_PER_PAGE, SECTIONS} from '../../constants'


export default function Page({page}) {
    return <Layout title="Taras Bunyk" sections={SECTIONS}>
        <PostList posts={[]} page={page}/>
        <Sidebar />
        <Footer />
    </Layout>
}

export async function getStaticPaths() {
    const paths = [];
    const ids = getAllPostIds();
    let count = Math.ceil(ids.length / POSTS_PER_PAGE);
    for(var i = 1; i<=count; i++) {
        paths.push({
            params: {
                page: i.toString()
            }
        })
    }
    return {
        paths,
        fallback: false
    }
}

export async function getStaticProps({ params }) {
    const allPosts = await getSortedPostsData();
    const offset = params.page * POSTS_PER_PAGE;
    return {
        props: {
            page: params.page,
            pagePosts: allPosts.slice(offset, offset + POSTS_PER_PAGE),
            totalPages: Math.ceil(allPosts.length / POSTS_PER_PAGE)
        }
    }
}
