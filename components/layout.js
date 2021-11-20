import Header from './header'
import Footer from './footer'

import {BLOG_TITLE} from '../constants'

export default function Layout({children, title}) {
    return <>
		<Header title={title || BLOG_TITLE}/>
		{children}
		<Footer />
    </>
}
