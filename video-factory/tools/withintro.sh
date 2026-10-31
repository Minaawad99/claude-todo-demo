#!/bin/bash
# withintro.sh <intro.mp4> <seconds> <overlay.png> <body.mp4> <out.mp4>: intro clip + hook card, hard cut into body; env CROP=w:h:x:y trims black bars first
pre=""; [ -n "$CROP" ] && pre="crop=$CROP,"
ffmpeg -v error -y -t $2 -i $1 -i $3 -i $4 -filter_complex "[0:v]${pre}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[iv];[iv][1]overlay=0:0,format=yuv420p[i];[0:a]aresample=44100,aformat=channel_layouts=stereo[ia];[2:v]setsar=1[bv];[2:a]aresample=44100[ba];[i][ia][bv][ba]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 -crf 20 -preset medium -c:a aac -b:a 160k -movflags +faststart $5
