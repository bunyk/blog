import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import highlight from 'remark-highlight.js'
import math from 'remark-math'
import remark2rehype from 'remark-rehype'
import katex from 'rehype-katex'
import stringify from 'rehype-stringify'
import unified from 'unified'
import markdown from 'remark-parse'


const postsDirectory = path.join(process.cwd(), 'content/posts')

var postIds = null;

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory)
    if (postIds == null) {
        postIds = fileNames.map(fileName => {
            const fullPath = path.join(postsDirectory, fileName)
            if (fs.lstatSync(fullPath).isDirectory()) {
                return null // Temporarily ignore directories
            }
            if (fileName[0] == '.') { // Ignore hidden files
                return null
            }
            const id = fileName.replace(/\.md$/, '')
            return id
        }).filter(post => post != null)
    }
    return postIds
}

async function md2html(md) {
    const content = await unified()
        .use(markdown)
        .use(highlight)
        .use(math)
        .use(remark2rehype)
        .use(katex, {
            throwOnError: true,
            output: 'html',
        })
        .use(stringify)
        .process(md)
    return content.toString()
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents,
        {excerpt_separator: '<!--more-->'}
    )
    return {
        id: id,
        ...matterResult.data,
        date: matterResult.data.date.toISOString().slice(0,10),
        excerpt: await md2html(matterResult.excerpt || ''),
        content: await md2html(matterResult.content)
    }
}

export async function getSortedPostsData() {
    const ids = getAllPostIds()
    return (await Promise.all(
        ids.map(async (id) => await getPostData(id))
    )).sort((a, b) => a.date < b.date ? 1 : -1)
}
