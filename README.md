Code to render [my blog](http://bunyk.github.io/) and its contents.

## Layout

Currently, it uses Next.js to build itself.

- `content/` folder contains markdown files that are the source of blog content
- `public/` contains static resources that do not need preprocessing (mostly images)
- `components/` React components that are used on the pages of blog
- `pages/` Next.JS components that display the pages
- `lib/` code with functions that help with reading markdown and providing data to render pages

## Running locally

```
npm install
npm run dev
```

## Building

`/deploy.sh` deals with that. It compiles everything into `out/` folder, and then copies it to [bunyk.github.io repository](https://github.com/bunyk/bunyk.github.com) and commits.
