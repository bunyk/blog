#!/bin/bash
set -ex

npm run build
npm run export

# This expects that 
# git clone git@github.com:bunyk/bunyk.github.com.git
# was done in sibling folder
cd ..
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

# Come Back up to the Project Root
cd ../blog
