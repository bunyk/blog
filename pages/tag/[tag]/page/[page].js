import PostList from '../../../../components/postlist'
import {getPageProps, getPostsTopics, pageCount} from '../../../../lib/posts'

export default function Page(props) {
    const pageURL = page => `/tag/${props.tag}/page/${page}`
    return <PostList
        posts={props.posts}
        pageNumber={props.pageNumber}
        pageURL={pageURL}
        pagesCount={props.pages}
        archives={props.archives}
        topics={props.topics}
    />
}

export async function getStaticPaths() {
    const paths = [];
    const tags = await getPostsTopics();
    for(var i=0; i<tags.length; i++) {
        for(var j = 1; j<=pageCount(tags[i].count); j++) {
            paths.push({
                params: {
                    page: j.toString(),
                    tag: tags[i].id,
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
    const props = await getPageProps(params.page, null, params.tag)
    props.tag = params.tag
    return {props}
}
