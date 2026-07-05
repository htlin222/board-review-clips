#!/bin/sh
set -e
mkdir -p public/sfx
afconvert -f mp4f -d aac /System/Library/Sounds/Tink.aiff public/sfx/Tink.m4a
afconvert -f mp4f -d aac /System/Library/Sounds/Pop.aiff public/sfx/Pop.m4a
afconvert -f mp4f -d aac /System/Library/Sounds/Glass.aiff public/sfx/Glass.m4a
echo "sfx copied to public/sfx/"
