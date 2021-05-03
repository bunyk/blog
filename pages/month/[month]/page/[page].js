import PostList from '../../../../components/postlist'
import {getAllPostIds, getPageProps, pageCount} from '../../lib/posts'
import {POSTS_PER_PAGE} from '../../../../constants'


export default function Page(props) {
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

export async function getStaticPaths() {
    const paths = [];
    const ids = getAllPostIds();
    let count = pageCount();
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
    const props = await getPageProps(params.page)
    return {props}
}
