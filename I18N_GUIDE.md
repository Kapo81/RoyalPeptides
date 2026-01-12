# Guide d'internationalisation (i18n)

## Vue d'ensemble

Le site Royal Peptides est maintenant entièrement bilingue avec le **français (Québec)** comme langue par défaut et l'anglais comme langue secondaire.

## Caractéristiques

- ✅ Langue par défaut : **fr-CA** (Français - Québec)
- ✅ Langue secondaire : **en** (English)
- ✅ Sélecteur de langue visible dans le header (desktop + mobile)
- ✅ Persistance du choix via localStorage
- ✅ Attribut `lang` sur `<html>` mis à jour dynamiquement
- ✅ SEO optimisé avec titres et meta traduisibles
- ✅ Design premium préservé
- ✅ Formatage des prix selon la locale

## Structure des fichiers

```
src/
├── i18n/
│   ├── index.ts                    # Configuration i18next
│   └── locales/
│       ├── fr-CA.json             # Traductions françaises (Québec)
│       └── en.json                # Traductions anglaises
├── components/
│   └── LanguageToggle.tsx         # Composant switch FR/EN
├── contexts/
│   └── LanguageContext.tsx        # Context wrapper pour i18next
└── lib/
    └── currency.ts                # Formatage des prix selon locale
```

## Utilisation dans les composants

### Importer le hook useLanguage

```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('about.title')}</h1>
      <p>{t('about.subtitle')}</p>
    </div>
  );
}
```

### Interpolation de variables

```tsx
// Dans fr-CA.json
{
  "cart": {
    "away_300": "Encore {{amount}} avant 10 % de rabais (300 $+)"
  }
}

// Dans le composant
<p>{t('cart.away_300', { amount: '$50' })}</p>
```

### Formatage des prix

```tsx
import { formatCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';

function ProductPrice({ price }: { price: number }) {
  const { language } = useLanguage();

  return (
    <span>{formatCurrency(price, language)}</span>
  );
}

// fr-CA: 299,99 $
// en: $299.99
```

## Ajouter une nouvelle traduction

1. Ouvrir `src/i18n/locales/fr-CA.json` et `src/i18n/locales/en.json`
2. Ajouter la clé dans les deux fichiers :

```json
// fr-CA.json
{
  "product": {
    "new_field": "Nouveau champ en français"
  }
}

// en.json
{
  "product": {
    "new_field": "New field in English"
  }
}
```

3. Utiliser dans un composant :

```tsx
<p>{t('product.new_field')}</p>
```

## Composant LanguageToggle

Le composant `LanguageToggle` est déjà intégré dans :
- Header desktop (Navigation)
- Header mobile (Navigation)

Pour l'utiliser ailleurs :

```tsx
import LanguageToggle from './components/LanguageToggle';

<LanguageToggle />
```

## Langue par défaut

La langue par défaut est définie dans plusieurs endroits :

1. **index.html** : `<html lang="fr-CA">`
2. **i18n/index.ts** :
   ```ts
   fallbackLng: 'fr-CA',
   lng: 'fr-CA',
   ```

## Persistance

Le choix de langue est automatiquement sauvegardé dans `localStorage` avec la clé `lang`.

La configuration i18next détecte automatiquement la langue dans cet ordre :
1. localStorage (`lang`)
2. Fallback à `fr-CA`

## Vérifier la langue active

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();

  console.log('Langue active:', i18n.language); // "fr-CA" ou "en"
}
```

## SEO et accessibilité

- L'attribut `lang` du `<html>` est automatiquement mis à jour via `i18n.on('languageChanged')`
- Les titres de page peuvent être traduits via le hook `t()`
- Structure schema.org compatible avec les deux langues

## Sections traduites

Les sections suivantes sont entièrement traduites :

✅ Navigation (header + footer)
✅ Page About (complète)
✅ Footer
✅ Trust chips / badges
✅ Étapes "How it works"
✅ FAQ
✅ CTA buttons
✅ Proof cards

## À traduire (pages restantes)

Les pages suivantes utilisent encore du contenu hardcodé et devront être traduites :
- Home page
- Catalogue page
- Stacks page
- Product detail page
- Cart page
- Checkout page
- Shipping page

Pour traduire ces pages, suivre le même pattern :
1. Ajouter les clés de traduction dans `fr-CA.json` et `en.json`
2. Remplacer le texte hardcodé par `t('cle.traduction')`

## Notes de style (Québec)

Le français québécois utilisé suit ces règles :
- Ton professionnel et premium (pas trop formel "France")
- Vocabulaire e-commerce naturel
- Termes clés :
  - "Livraison" (pas "expédition")
  - "Stacks de recherche" (terme technique conservé)
  - "En stock / Rupture de stock"
  - "Rabais" (pas "réduction")
  - "Panier" (pas "chariot")

## Dépannage

### La langue ne change pas

1. Vérifier que `localStorage.getItem('lang')` retourne la bonne valeur
2. Vérifier que `document.documentElement.lang` est mis à jour
3. Vider le cache navigateur

### Traduction manquante

Si une clé n'existe pas, i18next retourne la clé elle-même :
```tsx
t('cle.inexistante') // → "cle.inexistante"
```

Ajouter la clé dans les fichiers JSON pour résoudre.

### Build échoue

Vérifier que toutes les clés utilisées existent dans les deux fichiers de traduction.

## Ressources

- [react-i18next documentation](https://react.i18next.com/)
- [i18next documentation](https://www.i18next.com/)
