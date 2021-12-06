import Link from 'next/link'

import Layout from '../components/layout'
import {getSortedPostsData} from '../lib/posts'

export default function Home(props) {
    return <Layout>
		<ul>
		{props.posts.map(p => {
			return <li key={p.id}>
				{p.date.split('T')[0]}: <Link href={`/posts/${p.id}`}>{p.title}</Link>
			</li>
		})}
		</ul>
    </Layout>
}

export async function getStaticProps() {
    return {
		props: {
			posts: await getSortedPostsData()
		}
	}
}
