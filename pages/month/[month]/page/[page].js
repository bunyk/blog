import PostList from '../../../../components/postlist'
import {getPageProps, getPostsArchives, pageCount} from '../../../../lib/posts'

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
    const months = await getPostsArchives();
    for(var i=0; i<months.length; i++) {
        for(var j = 1; j<=pageCount(months[i].count); j++) {
            paths.push({
                params: {
                    page: j.toString(),
                    month: months[i].id,
                }
            })
        }
    }
    return {
        paths,
        fallback: false
    }
}


export async function getStaticProps({ params }) {
    const props = await getPageProps(params.page, params.month)
    return {props}
}
