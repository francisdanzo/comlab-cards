# ComLab — Je suis membre

Générateur de visuels « **Je suis membre de ComLab** » (Community Laboratory).
Chaque membre ajoute sa photo ou son logo, la recadre lui-même, choisit une police pour son nom et télécharge un visuel 2508×2508 prêt à partager.

Tout se passe dans le navigateur (canvas) : aucune image n'est envoyée sur un serveur.

## Fonctionnalités

- **Recadrage libre** de la photo / du logo : glisser pour déplacer, molette, pincement ou curseur pour zoomer. En dézoomant au maximum, un logo s'affiche en entier sur fond blanc.
- **12 polices** choisies pour le template (Montserrat italique façon « MEMBRE », Poppins, Exo 2, Rajdhani, Orbitron, Oswald, Bebas Neue, Comfortaa, Playfair Display, Kaushan Script, Pacifico…), avec un aperçu du nom dans chacune.
- **4 couleurs** pour le nom (bleu nuit, bleu ComLab, rouge, noir) et une option MAJUSCULES.
- Les noms longs passent sur 2 lignes ou rétrécissent automatiquement pour rester dans la pilule.

## Développement

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # tests Jest
npm run build
```

## Personnalisation

| Quoi | Où |
| --- | --- |
| Template et zones (cercle photo, pilule du nom) | `src/config/templates.ts` — coordonnées en pixels du template 2508×2508 |
| Polices, couleurs | `src/config/fonts.ts` (ajouter la famille aussi dans `GOOGLE_FONTS_URL`) |
| Logique de recadrage | `src/lib/crop.ts`, `src/components/PhotoCropper.tsx` |
| Rendu canvas | `src/lib/generateCard.ts` |

`public/templates/membre.png` est le template source ; l'app utilise `membre.jpg` (même image, plus légère). Si tu changes le template, régénère le JPEG :

```bash
node -e "require('sharp')('public/templates/membre.png').jpeg({quality:92,chromaSubsampling:'4:4:4',mozjpeg:true}).toFile('public/templates/membre.jpg')"
```

## Déploiement

Projet Next.js 14, déployable tel quel sur Vercel.
