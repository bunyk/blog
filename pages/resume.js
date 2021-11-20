import Layout from '../components/layout'


export default function ResumePage() {
    return <Layout title="Resume">
		    <embed
                type="application/pdf"
                src="content/resume.pdf"
                style={{
                    width: '100%',
                    'min-height': '900px',
                }}
            />
    </Layout>
}
