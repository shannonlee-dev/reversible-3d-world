from pathlib import Path
import sys
from fontTools import subset

root = Path(__file__).resolve().parents[1]
text = ''.join(path.read_text() for path in (root / 'source').iterdir()
               if path.suffix in {'.js', '.html'})
options = subset.Options()
options.flavor = 'woff2'
options.notdef_glyph = True
options.notdef_outline = True
font = subset.load_font(sys.argv[1], options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, root / 'assets/forest.woff2', options)
print('Updated embedded font for source text')
