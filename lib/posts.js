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

import {POSTS_PER_PAGE} from '../constants'


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

export async function getAllPostsData() {
    const ids = getAllPostIds()
    return await Promise.all(
        ids.map(async (id) => await getPostData(id))
    )
}

export async function getPostsArchives() {
    const allDates = (await getAllPostsData()).map(p => p.date)
    return allDates.map(d => ({
        url: d,
        title: d,
    }))
}

export async function getSortedPostsData() {
    return (await getAllPostsData()).sort((a, b) => a.date < b.date ? 1 : -1)
}

export async function getPageProps(page) {
    const allPosts = await getSortedPostsData();
    const offset = (page - 1) * POSTS_PER_PAGE;
    const pagePosts = allPosts.slice(offset, offset + POSTS_PER_PAGE)
    const archives = await getPostsArchives();
    return {
        pageNumber: page,
        posts: pagePosts,
        pages: Math.ceil(allPosts.length / POSTS_PER_PAGE),
        archives: archives,
        topics: archives,
    }
}

