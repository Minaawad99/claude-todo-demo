"""Contact sheet of shotsheet.js frames: python3 montage.py <frames dir> <out.png> <first> <last+1>
Crops each frame to the card's picture + caption so 12 shots fit on one readable sheet."""
import sys, glob
from PIL import Image
d, out, a, b = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
fs = sorted(glob.glob(d + '/*.png'))[a:b]
ims = [Image.open(x).crop((0, 0, 540, 700)) for x in fs]
cols = 4; w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (w * cols, h * rows), 'white')
for i, im in enumerate(ims): sh.paste(im, ((i % cols) * w, (i // cols) * h))
sh.thumbnail((2000, 2600)); sh.save(out)
