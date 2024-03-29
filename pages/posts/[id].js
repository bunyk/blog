import Layout from '../../components/layout'
import CommentsSection from '../../components/comments'
import {getAllPostIds, getPostData} from '../../lib/posts'


export default function Page(post) {
    return <Layout title={post.title}>
       <article>
            <h1>{post.title}</h1>
            <div><em>
				{'Published: ' + post.date}
				{/*
					TODO: rename date to created_at, make both dates, not strings, maybe switch to TS
						(post.updated_at != post.date)? ' Updated: ' + post.updated_at:''
				*/}
			</em></div>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <CommentsSection post={post}/>
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
    return {
        props: await getPostData(params.id, true)
    }
}

