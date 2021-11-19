import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import highlight from 'remark-highlight.js'
import math from 'remark-math'
import remark2rehype from 'remark-rehype'
import katex from 'rehype-katex'
import stringify from 'rehype-stringify'
import {unified} from 'unified'
import markdown from 'remark-parse'


const postsDirectory = path.join(process.cwd(), 'content/posts')

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames.map(fileName => {
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

    const matterResult = matter(fileContents)
    return {
        id: id,
        ...matterResult.data,
        date: matterResult.data.date.toISOString().slice(0,10),
        content: await md2html(matterResult.content)
    }
}

var postsCache = null;
async function getAllPostsData() {
    if(postsCache == null) {
        const ids = getAllPostIds()
        postsCache =  await Promise.all(
            ids.map(async (id) => await getPostData(id))
        )
    }
    return postsCache
}

function getMonth(p) {
    return p.date.slice(0, 7)
}

function hasTopic(p, topic) {
    return !topic || (p.tags && p.tags.indexOf(topic) >= 0)
}

export async function queryPosts(month, topic) {
    return (await getAllPostsData())
        .filter(p => !month || (getMonth(p) == month))
        .filter(p => hasTopic(p, topic))

}

export async function getSortedPostsData(month, topic) {
    return (await queryPosts(month, topic))
        .sort((a, b) => a.date < b.date ? 1 : -1)
}


export async function getPageProps(month, topic) {
    const posts = await getSortedPostsData(month, topic);
    return { posts }
}

