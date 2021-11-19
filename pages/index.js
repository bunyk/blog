import PostList from '../components/postlist'
import {getPageProps} from '../lib/posts'

export default function Home(props) {
    return <PostList
        posts={props.posts}
    />
}

export async function getStaticProps({ params }) {
    const props = await getPageProps()
    return {props}
}
