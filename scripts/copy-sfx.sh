#!/bin/sh
set -e
mkdir -p public/sfx
afconvert -f mp4f -d aac /System/Library/Sounds/Tink.aiff public/sfx/Tink.m4a
afconvert -f mp4f -d aac /System/Library/Sounds/Pop.aiff public/sfx/Pop.m4a
afconvert -f mp4f -d aac /System/Library/Sounds/Glass.aiff public/sfx/Glass.m4a
echo "sfx copied to public/sfx/"

# Background music: served from public/ via staticFile, kept out of git.
if [ -f assets/bg_music.mp3 ]; then
  cp assets/bg_music.mp3 public/bg_music.mp3
  echo "bg music copied to public/bg_music.mp3"
fi
