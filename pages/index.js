import Footer from '../components/footer'
import Header from '../components/header'
import Layout from '../components/layout'
import PostList from '../components/postlist'
import Sidebar from '../components/sidebar'
import {getSortedPostsData} from '../lib/posts'
import {SECTIONS, POSTS_PER_PAGE} from '../constants'

export default function Home({page, pages}) {
    return <Layout title="Taras Bunyk" sections={SECTIONS}>
        <PostList posts={page} page={1} pages={pages}/>
        <Sidebar />
        <Footer />
    </Layout>
}

export async function getStaticProps({ params }) {
    const allPosts = await getSortedPostsData();
    return {
        props: {
            page: allPosts.slice(0, POSTS_PER_PAGE),
            pages: Math.ceil(allPosts.length / POSTS_PER_PAGE)
        }
    }
}
