import PostList from '../components/postlist'
import {getPageProps} from '../lib/posts'

export default function Home(props) {
    return <PostList
        posts={props.posts}
        pageNumber={props.pageNumber}
        pageURL={pageURL}
        pagesCount={props.pages}
        archives={props.archives}
        topics={props.topics}
    />
}

function pageURL(page) {
    return `/page/${page}`
}

export async function getStaticProps({ params }) {
    const props = await getPageProps(1)
    return {props}
}
