from pathlib import Path
import base64
root=Path(__file__).resolve().parents[1]
shell=(root/'source/shell.html').read_text()
world=(root/'source/world.js').read_text().replace('// __EXPERIENCE__','\n'.join((root/'source'/name).read_text() for name in ['story.js','journey.js','experience.js','first-person.js']))
engine=(root/'assets/three.min.js').read_text()
# The pinned UMD release starts with a deprecation notice; keep its license intact.
engine='void '+engine[engine.index('/**'):]
font_data=base64.b64encode((root/'assets/forest.woff2').read_bytes()).decode()
font="@font-face{font-family:'Forest Sans';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,"+font_data+") format('woff2')}"
html=shell.replace('__FONT__',font).replace('__THREE__',engine).replace('__WORLD__',world)
for name in ['three-license.txt','font-license.txt']:
 p=root/'assets'/name
 if p.exists():html+='\n<!-- '+p.read_text().replace('--','—')+' -->'
(root/'index.html').write_text(html)
print('Built standalone index.html:',len(html.encode()),'bytes')
