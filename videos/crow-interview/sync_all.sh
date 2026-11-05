#!/bin/bash
# Re-sync every Veo clip with our voice. Usage: ./sync_all.sh <clips dir> <out dir>
cd "$(dirname "$0")"; C=$1; O=$2; mkdir -p $O
while read k n opt; do [ -f $C/$k.mp4 ] || continue; spk=host; mx=""; [[ $k == K* ]] && spk=crow && mx="--max 1.4"
  python3 lipfit.py $C/$k.mp4 final/$n-$spk.wav $O/$k.mp4 $opt $mx > /dev/null < /dev/null && echo "$k ok"; done <<'L'
H01 01
H03 03 --skip 1
H06 06
H09 09
H12 12
H16 16
H22 22
H23 23
K02 02
K04 04 --part 0:5.85
K05 05
K07 07 --part 0:1.50
K10 10
K17 17
K18 18 --part 0:6.15
K21 21 --span
K24 24
L
