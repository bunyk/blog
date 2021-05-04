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

function groupBy(items, key) {
    const counts = {};
    items.forEach(i => {
        const k = key(i)
        counts[k] = (counts[k] || 0) + 1;
    })
    return counts
}

export async function getPostsArchives() {
    const months = groupBy(
        await getAllPostsData(),
        getMonth
    )
    return Object.keys(months).sort().map(d => ({
        url: `/month/${d}/page/1`,
        id: d,
        count: months[d],
        title: d,
    }))
}

export async function getPostsTopics() {
    const topics = groupBy(
        (await getAllPostsData()).flatMap(p => p.tags || []),
        x => x,
    )
    return Object.keys(topics).sort().map(t => ({
        url: `/tag/${t}/page/1`,
        id: t,
        title: t,
        count: topics[t],
    }))
}

function getMonth(p) {
    return p.date.slice(0, 7)
}

export async function queryPosts(month, topic) {
    return (await getAllPostsData())
        .filter(p => !month || (getMonth(p) == month))
}

export async function getSortedPostsData(month, topic) {
    return (await queryPosts(month, topic))
        .sort((a, b) => a.date < b.date ? 1 : -1)
}

export function pageCount(postsNumber) {
    return Math.ceil(postsNumber / POSTS_PER_PAGE)
}

export async function getPageProps(page, month, topic) {
    const allPosts = await getSortedPostsData(month, topic);
    const offset = (page - 1) * POSTS_PER_PAGE;
    const pagePosts = allPosts.slice(offset, offset + POSTS_PER_PAGE)
    const archives = await getPostsArchives();
    const topics = await getPostsTopics();
    return {
        pageNumber: page,
        posts: pagePosts,
        pages: pageCount(allPosts.length),
        archives: archives,
        topics: topics,
    }
}

