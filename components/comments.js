import {DiscussionEmbed} from "disqus-react"

export default function CommentsSection({post}) {
  const disqusShortname = "bunykshumblehomepage"
  const disqusConfig = {
    url: "https://bunyk.github.io/posts/" + post.id,
    identifier: post.id, // Single post id
    title: post.title // Single post title
  }
  return (
    <div>
      <DiscussionEmbed
        shortname={disqusShortname}
        config={disqusConfig}
      />
    </div>
  )
}
