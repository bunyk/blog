#!/bin/bash
set -ex

npm run build
npm run export

# This expects that 
# git clone git@github.com:bunyk/bunyk.github.com.git
# was done in sibling folder
cd ..
rm -r bunyk.github.com/content/
rm -r bunyk.github.com/month/
rm -r bunyk.github.com/_next/
rm -r bunyk.github.com/page/
rm -r bunyk.github.com/posts/
rm -r bunyk.github.com/tag/
cp -r blog/out/* bunyk.github.com
cd bunyk.github.com
git add .

msg="blog update `date`"
if [ $# -eq 1 ]
  then msg="$1"
fi
git commit -m "$msg"

# Push source and build repos.
git push origin master

# Come back up to the project root
cd ../blog
