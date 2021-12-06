import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {exec} from 'child_process'

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
            return null // Ignore directories
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


async function getPostUpdateDate(id) {
	const command = `git log -1 --format="%ad" --date="iso-strict" content/posts/${id}.md`
	return new Promise(resolve => {
		exec(command, function(error, stdout, stderr){ resolve(stdout); });
	});
}

export async function getPostData(id, withContent) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents)
    return {
        id: id,
        ...matterResult.data,
        date: matterResult.data.date.toISOString(),
		updated_at: await getPostUpdateDate(id),
        content: withContent && (await md2html(matterResult.content))
    }
}

async function getAllPostsData() {
	const ids = getAllPostIds()
	return await Promise.all(
		ids.map(async (id) => await getPostData(id, false))
	)
}

export async function getSortedPostsData() {
    return (await getAllPostsData())
        .sort((a, b) => a.date < b.date ? 1 : -1)
}
