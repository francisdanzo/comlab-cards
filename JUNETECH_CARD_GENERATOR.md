# JUNETECH 2026 — Card Generator Platform

## Vue d'ensemble

Plateforme web permettant aux participants de JuneTech 2026 de générer automatiquement une card personnalisée à partager sur les réseaux sociaux. Chaque type de participant (Attendee, Speaker, Volunteer) a son propre lien secret qui charge le bon template.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Composition image | Canvas API (côté client, no server) |
| Hébergement | Vercel |
| Styling | Tailwind CSS |
| Langue | TypeScript |

Tout le traitement image se fait **côté client** via Canvas API — zéro backend, zéro coût serveur.

---

## Structure des routes

```
/attendee    → Template Attendee
/speaker     → Template Speaker
/volunteer   → Template Volunteer
/            → Page 404 ou page blanche (aucun accès sans route)
```

Chaque route est **indépendante** — impossible de naviguer d'une route à l'autre depuis l'interface.

---

## Structure du projet

```
junetech-cards/
├── public/
│   └── templates/
│       ├── attendee.png       ← Template PNG Attendee (1080x1080)
│       ├── speaker.png        ← Template PNG Speaker (1080x1080)
│       └── volunteer.png      ← Template PNG Volunteer (1080x1080)
├── src/
│   └── app/
│       ├── attendee/
│       │   └── page.tsx
│       ├── speaker/
│       │   └── page.tsx
│       ├── volunteer/
│       │   └── page.tsx
│       └── layout.tsx
├── src/
│   └── components/
│       └── CardGenerator.tsx  ← Composant principal réutilisable
├── src/
│   └── lib/
│       └── generateCard.ts    ← Logique Canvas
└── src/
    └── config/
        └── templates.ts       ← Config de chaque template (positions texte, police, couleur)
```

---

## Flow utilisateur

```
1. Participant ouvre son lien (/attendee, /speaker ou /volunteer)
2. Il voit un formulaire simple :
   - Champ "Nom complet" (texte libre)
   - Champ "Domaine" (menu déroulant + option "Autre" avec champ texte libre)
   - Zone upload photo (click ou drag & drop)
3. Dès que les 3 champs sont remplis → prévisualisation générée automatiquement
4. Bouton "Télécharger ma card" → image PNG 1080x1080 téléchargée
```

Pas de bouton "Générer" — la card se génère **automatiquement** dès que tous les champs sont remplis.

---

## Composant principal — CardGenerator.tsx

Ce composant est réutilisé sur les 3 routes. Il reçoit en props le type de template.

### Props

```typescript
interface CardGeneratorProps {
  templateType: 'attendee' | 'speaker' | 'volunteer'
}
```

### État interne

```typescript
const [name, setName] = useState('')
const [domain, setDomain] = useState('')
const [customDomain, setCustomDomain] = useState('')       // Si "Autre" sélectionné
const [photo, setPhoto] = useState<File | null>(null)
const [previewUrl, setPreviewUrl] = useState<string | null>(null)
```

### Logique auto-génération

```typescript
useEffect(() => {
  const effectiveDomain = domain === 'Autre' ? customDomain : domain
  if (name && effectiveDomain && photo) {
    generateCard({ name, domain: effectiveDomain, photo, templateType })
      .then(setPreviewUrl)
  }
}, [name, domain, customDomain, photo, templateType])
```

---

## Logique Canvas — generateCard.ts

```typescript
interface GenerateCardParams {
  name: string
  domain: string
  photo: File
  templateType: 'attendee' | 'speaker' | 'volunteer'
}

export async function generateCard(params: GenerateCardParams): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  // 1. Charger et dessiner la photo du participant
  //    - Recadrage automatique en carré centré (object-fit: cover)
  //    - Positionnée dans la zone définie par la config du template

  // 2. Charger et dessiner le template PNG par-dessus
  //    - Le template a une zone transparente pour la photo
  //    - Il recouvre les bords de la photo automatiquement

  // 3. Écrire le nom du participant
  //    - Position X/Y définie dans templates.ts
  //    - Police, taille, couleur définis dans templates.ts

  // 4. Écrire le domaine du participant
  //    - Position X/Y définie dans templates.ts
  //    - Style différent du nom (plus petit, italique ou couleur différente)

  // 5. Retourner le canvas en dataURL PNG
  return canvas.toDataURL('image/png')
}
```

---

## Configuration des templates — templates.ts

Ce fichier centralise toutes les positions et styles pour chaque template. À ajuster selon les templates PNG finaux.

```typescript
export interface TemplateConfig {
  templatePath: string
  photoZone: {
    x: number      // Position X de la zone photo (pixels)
    y: number      // Position Y de la zone photo (pixels)
    width: number  // Largeur de la zone photo
    height: number // Hauteur de la zone photo
    shape: 'circle' | 'rectangle'  // Forme du cadre photo
  }
  nameText: {
    x: number
    y: number
    fontSize: number
    fontFamily: string
    color: string
    align: 'left' | 'center' | 'right'
    maxWidth: number  // Pour le retour à la ligne auto
  }
  domainText: {
    x: number
    y: number
    fontSize: number
    fontFamily: string
    color: string
    align: 'left' | 'center' | 'right'
    maxWidth: number
  }
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  attendee: {
    templatePath: '/templates/attendee.png',
    photoZone: {
      x: 90,
      y: 90,
      width: 400,
      height: 400,
      shape: 'circle'
    },
    nameText: {
      x: 540,
      y: 400,
      fontSize: 52,
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      align: 'center',
      maxWidth: 900
    },
    domainText: {
      x: 540,
      y: 480,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      color: '#E0E0E0',
      align: 'center',
      maxWidth: 900
    }
  },
  speaker: {
    // Mêmes champs, valeurs différentes selon le template Speaker
    templatePath: '/templates/speaker.png',
    photoZone: { x: 90, y: 90, width: 400, height: 400, shape: 'circle' },
    nameText: { x: 540, y: 400, fontSize: 52, fontFamily: 'Inter, sans-serif', color: '#FFFFFF', align: 'center', maxWidth: 900 },
    domainText: { x: 540, y: 480, fontSize: 32, fontFamily: 'Inter, sans-serif', color: '#E0E0E0', align: 'center', maxWidth: 900 }
  },
  volunteer: {
    templatePath: '/templates/volunteer.png',
    photoZone: { x: 90, y: 90, width: 400, height: 400, shape: 'circle' },
    nameText: { x: 540, y: 400, fontSize: 52, fontFamily: 'Inter, sans-serif', color: '#FFFFFF', align: 'center', maxWidth: 900 },
    domainText: { x: 540, y: 480, fontSize: 32, fontFamily: 'Inter, sans-serif', color: '#E0E0E0', align: 'center', maxWidth: 900 }
  }
}
```

> ⚠️ **Note pour Claude Code** : Les valeurs X/Y dans `templates.ts` sont des placeholders. Une fois les vrais templates PNG fournis, mesurer les zones exactes dans Figma ou avec un outil de sélection de pixels et mettre à jour ce fichier.

---

## Liste des domaines (menu déroulant)

```typescript
export const DOMAINS = [
  'Étudiant(e)',
  'Développeur / Développeuse',
  'Designer',
  'Entrepreneur(e)',
  'Chercheur / Chercheuse',
  'Ingénieur(e)',
  'Product Manager',
  'Data Scientist',
  'Journaliste / Médias',
  'Enseignant(e)',
  'Investisseur / Investisseuse',
  'Autre'  // ← Déclenche un champ texte libre
]
```

---

## UI — Design de la page

Interface minimaliste, mobile-first.

```
┌─────────────────────────────────────┐
│  Logo JUNETECH 2026                 │
│  "Génère ta card JuneTech"          │
├─────────────────────────────────────┤
│                                     │
│  [ Zone upload photo                │
│    Clique ou glisse ta photo ]      │
│                                     │
│  Nom complet                        │
│  [________________________]         │
│                                     │
│  Domaine                            │
│  [▼ Sélectionne ton domaine  ]      │
│  (Si "Autre" → champ texte)         │
│                                     │
├─────────────────────────────────────┤
│  PRÉVISUALISATION (auto)            │
│  ┌───────────────────────────────┐  │
│  │   [card générée en temps réel]│  │
│  └───────────────────────────────┘  │
│                                     │
│  [ ⬇ Télécharger ma card ]         │
│                                     │
└─────────────────────────────────────┘
```

---

## Comportement upload photo

- Formats acceptés : JPG, PNG, WEBP
- Taille max recommandée : 10MB (limiter côté client)
- Recadrage automatique en carré centré (crop center) — pas de demande de recadrage à l'utilisateur
- Pas de compression nécessaire (Canvas gère la mise à l'échelle)

---

## Téléchargement

```typescript
function downloadCard(dataUrl: string, participantName: string) {
  const link = document.createElement('a')
  link.download = `junetech-2026-${participantName.toLowerCase().replace(/\s+/g, '-')}.png`
  link.href = dataUrl
  link.click()
}
```

---

## Déploiement Vercel

```bash
# 1. Créer le projet Next.js
npx create-next-app@latest junetech-cards --typescript --tailwind --app

# 2. Installer les dépendances (aucune dépendance externe requise pour Canvas)

# 3. Ajouter les templates PNG dans /public/templates/

# 4. Push sur GitHub

# 5. Connecter à Vercel → deploy automatique
```

Variables d'environnement : **aucune requise** (tout est statique côté client).

---

## Points d'attention pour Claude Code

1. **CORS photo** : Utiliser `createObjectURL(file)` pour la photo uploadée — pas de problème CORS puisque c'est un fichier local.

2. **Canvas taint** : Ne pas charger d'images externes dans le canvas (seulement le template depuis `/public/` et la photo locale). Le template doit être servi depuis le même domaine.

3. **Police custom** : Si le design utilise une police custom, la charger avec `FontFace` API avant de dessiner le texte sur le canvas, sinon Canvas utilisera une police système par défaut.

4. **Photo circulaire** : Si `shape: 'circle'`, utiliser `ctx.arc()` + `ctx.clip()` avant de dessiner la photo.

5. **Retour à la ligne nom** : Implémenter `ctx.measureText()` pour gérer les noms longs et éviter le débordement.

6. **Mobile** : L'upload photo doit ouvrir la caméra sur mobile (`accept="image/*" capture="user"` optionnel).

7. **Positions templates** : Les X/Y dans `templates.ts` sont des **placeholders** — les mettre à jour une fois les vrais PNG disponibles.

---

## Checklist de livraison

- [ ] Route `/attendee` fonctionnelle avec template attendee
- [ ] Route `/speaker` fonctionnelle avec template speaker
- [ ] Route `/volunteer` fonctionnelle avec template volunteer
- [ ] Route `/` redirige vers 404 ou page blanche
- [ ] Upload photo fonctionne (desktop + mobile)
- [ ] Prévisualisation auto dès que les 3 champs sont remplis
- [ ] Téléchargement PNG 1080x1080
- [ ] Champ "Autre" avec texte libre fonctionnel
- [ ] Responsive mobile-first
- [ ] Déployé sur Vercel avec URL publique
