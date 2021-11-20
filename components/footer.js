import Link from 'next/link'

export default function Footer() {
    return <>
		<nav>
			<Link href="/" passHref>Home</Link>
			<a href="#top">Back to top</a>
		</nav>
		<footer>
		  © {new Date().getFullYear()} Bunyk Taras. Built with Next.js
    	</footer>
	</>
}
