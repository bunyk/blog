import Head from 'next/head'
import Link from 'next/link'

import {SECTIONS, BLOG_TITLE} from '../constants'


export default function Header({title}) {
    return <>
        <Head>
            <title>{title}</title>
        </Head>
		<h1 id="top">{BLOG_TITLE}</h1>
		<nav>
		{SECTIONS.map((section) => {
			return <Link href={section.url} key={section.url} passHref>
				{section.title}
			</Link>
		})}
        </nav>
    </>
}
