# «Gaz lacrymogène : comment ça marche ?» (French, health and safety) — no opening card (line 0 is a drawn shot), the summary card and the coloured caption words (o orange, b blue, g olive)
CFG = {
    "title": "Gaz lacrymogène : comment ça marche ?",
    "category": "Santé",
    "hook": "",
    "outro": '<div class="q">Gaz lacrymogène : les bons réflexes</div><svg id="outroArt" viewBox="0 0 580 300"></svg>'
             '<div class="leg"><span><b>1</b>S\'éloigner, face au vent</span><span><b>2</b>Ne pas frotter les yeux</span><span><b>3</b>Rincer : eau ou sérum</span><span><b>4</b>Surveiller la respiration</span></div>'
             '<div class="stat"><div class="n" style="font-size:32px;white-space:nowrap">≈ 30 min</div><div class="t">en général, ça passe<br>à l\'air libre</div></div>'
             '<div class="pts">1. Le « gaz » est une poudre : le CS.<br>'
             '2. Citron, vinaigre, dentifrice, lait : non.<br>'
             '3. Mal à respirer, mal à la poitrine, yeux après 1 h : le 15.'
             '<div style="margin-top:10px;border:1px solid #2b2b2b;padding:6px 4px;text-align:center;font:800 11.5px/1.6 Noto Sans">Dis-nous en commentaire…<br><span style="color:#c4532c">ce que tu veux qu\'on t\'explique la prochaine fois !</span></div></div>',
}
K = {0: {"brûlent,": "o", "pleures,": "o", "tousses,": "o"}, 1: {"lacrymogène,": "b", "rue": "g"}, 2: {"exactement,": "b", "corps": "g"},
     3: {"marche": "o"}, 4: {"pas": "o", "gaz.": "o"}, 5: {"poudre": "o", "CS,": "b", "neuf": "o", "vingt-huit": "o"},
     6: {"charge": "o", "chauffe,": "o", "fumée,": "b", "millions": "o"}, 7: {"lourdes": "o", "sol.": "g"}, 8: {"humides,": "b", "douleur.": "o"},
     9: {"wasabi,": "g", "fort.": "o"}, 10: {"secondes,": "o", "larmes,": "b", "toux,": "b"}, 11: {"demi-heure": "o", "libre.": "b"},
     12: {"t'éloignes": "g", "marchant,": "g"}, 13: {"vent,": "b", "haut.": "g"}, 14: {"frottes": "o", "pas": "o"},
     15: {"d'eau": "b", "propre,": "b", "sérum": "b", "physiologique,": "b"}, 16: {"lentilles,": "b", "propres.": "g"},
     17: {"citron,": "g", "vinaigre": "g", "dentifrice.": "g"}, 18: {"Raté": "o", "irrite": "o", "l'eau.": "b"}, 19: {"lait": "g", "stérile,": "o"},
     20: {"froide": "b", "savon,": "g", "vêtements": "g"}, 21: {"respires": "o", "poitrine,": "o", "heure,": "o", "quinze.": "o"},
     22: {"asthmatiques,": "o", "enfants": "o", "âgées.": "o"}, 23: {"interdit": "o", "guerre": "o", "Convention": "b"}, 24: {"l'autorise": "b", "l'ordre.": "b"},
     25: {"t'éloignes,": "g", "frottes": "o", "rinces": "b", "respiration.": "b"}}
