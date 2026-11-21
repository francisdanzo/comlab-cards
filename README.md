# ComLab — Je suis membre

Générateur de visuels « **Je suis membre de ComLab** » (Community Laboratory).
Chaque membre ajoute sa photo ou son logo, la recadre lui-même, choisit une police pour son nom et télécharge un visuel 2508×2508 prêt à partager.

Tout se passe dans le navigateur (canvas) : aucune image n'est envoyée sur un serveur.

## Fonctionnalités

- **Rôle sur la plateforme** écrit dans le bandeau bleu (à la place de « MEMBRE ») : Startup, Talent, Company, Professionnel, Institution Académique, ONG, Institution Gouvernementale.

- **Recadrage libre** de la photo / du logo : glisser pour déplacer, molette, pincement ou curseur pour zoomer. En dézoomant au maximum, un logo s'affiche en entier sur fond blanc.
- **12 polices** choisies pour le template (Montserrat italique façon « MEMBRE », Poppins, Exo 2, Rajdhani, Orbitron, Oswald, Bebas Neue, Comfortaa, Playfair Display, Kaushan Script, Pacifico…), avec un aperçu du nom dans chacune.
- **4 couleurs** pour le nom (bleu nuit, bleu ComLab, rouge, noir) et une option MAJUSCULES.
- Les noms longs passent sur 2 lignes ou rétrécissent automatiquement pour rester dans la pilule.
- Le visuel généré s'ouvre en **superposition** ; le bouton « Télécharger » affiche alors le **choix de la qualité**, avec la taille réelle de chaque fichier :
  PNG sans perte (2508 px), JPEG haute qualité, JPEG standard, JPEG léger (1080 px).
  Le rendu part du template PNG d'origine, donc le PNG téléchargé est identique pixel pour pixel au template.
- Avertissement si la photo est trop petite pour le cadrage choisi (risque de flou).

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
| Liste des rôles | `src/config/roles.ts` |
| Polices, couleurs | `src/config/fonts.ts` (ajouter la famille aussi dans `GOOGLE_FONTS_URL`) |
| Logique de recadrage | `src/lib/crop.ts`, `src/components/PhotoCropper.tsx` |
| Rendu canvas | `src/lib/generateCard.ts` |
| Formats / qualités de téléchargement | `src/config/exports.ts` |

`public/templates/membre.png` est le template du designer. L'app utilise `membre-base.png`, la même image avec le mot « MEMBRE » effacé du bandeau. Si tu remplaces le template, recompresse-le sans perte puis régénère la base :

```bash
node -e "require('sharp')('membre-source.png').png({compressionLevel:9,adaptiveFiltering:true,palette:false}).toFile('public/templates/membre.png')"
node scripts/make-template-base.cjs
```

Si le bandeau change de place, ajuste `BOX` dans le script et `roleText` dans `src/config/templates.ts`.

## Déploiement

Projet Next.js 14, déployable tel quel sur Vercel.
