# klein d – 3D-Modell Haus & Grundstück (Entwurf 94)

Statische Seite, ausgeliefert von nginx (Dockerfile). Ziel: klein-d.lutzwoellert.de

- Coolify: Build Pack **Dockerfile**, Port **80**
- Passwortschutz: Umgebungsvariablen `SITE_USER` und `SITE_PASS` setzen (ohne `SITE_PASS` ist die Seite offen)
- Suchmaschinen sind per robots.txt, Meta-Tag und Header ausgesperrt
- `public/index.html` = Startseite mit eingebettetem Modell und Vollbild-Knopf, `public/modell/` = das Modell selbst
- Neuer Stand: Ordner `public/` ersetzen, committen, pushen
