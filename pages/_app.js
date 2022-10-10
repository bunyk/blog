import 'highlight.js/styles/github.css'
import '../styles.css'
import { GoogleAnalytics } from "nextjs-google-analytics";

function MyApp({ Component, pageProps }) {
  return <>
    <GoogleAnalytics trackPageViews gaMeasurementId="UA-42001280-1"/>
	<Component {...pageProps} />
  </>
}

export default MyApp
