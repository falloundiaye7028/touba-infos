# Connecteur Claude « Rédaction Touba Infos »

Ce document décrit le connecteur MCP de toubainfos.com, sa compatibilité avec les clients Claude, et sa mise en service.
Vérifié le 25 octobre 2026 sur la documentation publique d'Anthropic (sources en fin de page).

## Ce que fait le connecteur

| Élément | Valeur |
| --- | --- |
| Adresse | `https://toubainfos.com/api/touba-infos/mcp` |
| Protocole | MCP, transport **Streamable HTTP**, sans état, réponses JSON (pas de flux SSE, pas de session) |
| Versions MCP acceptées | 2025-11-25, 2025-06-18, 2025-03-26, 2024-11-05 |
| Authentification | En-tête `Authorization: Bearer <TOUBA_INFOS_MCP_SECRET>` |
| Outils | `creer_brouillon`, `lister_brouillons`, `lire_article` |
| Ce qu'il ne peut **pas** faire | publier, modifier, supprimer, changer un statut, mettre « à la une » |

Chaque brouillon créé reste invisible sur le site jusqu'à sa publication par un humain dans `/admin`.

## Compatibilité par client Claude

| Client | Fonctionne avec un jeton fixe ? | Comment |
| --- | --- | --- |
| claude.ai, Claude Desktop, mobile, Cowork (connecteur personnalisé) | **Oui, si votre organisation a accès aux « Request headers » (bêta)** | Authentification « No sign-in » + en-tête `authorization` |
| Claude Code | Oui | `claude mcp add --transport http … --header "Authorization: Bearer …"` |
| API Claude (MCP connector) | Oui | champ `authorization_token` du serveur dans `mcp_servers` |

### Point d'attention : les en-têtes de requête sont en bêta

D'après la documentation d'Anthropic, l'authentification par **en-têtes de requête** des connecteurs personnalisés est **en bêta et disponible pour un ensemble limité d'organisations**. Si la section **Request headers** n'apparaît pas dans la fenêtre « Add custom connector », votre compte n'y a pas encore accès.

Dans ce cas, trois possibilités :

1. **Attendre l'ouverture** de la fonctionnalité à votre compte (rien à changer côté site).
2. **Utiliser Claude Code ou l'API**, qui acceptent le jeton fixe dès aujourd'hui.
3. **Ajouter OAuth** au connecteur (évolution future : serveur d'autorisation, métadonnées `/.well-known/oauth-protected-resource`, callback `https://claude.ai/api/mcp/auth_callback`). Ce n'est pas inclus dans cette PR.

Ne jamais mettre le jeton dans l'URL (`?token=…`) : la documentation d'Anthropic et la spécification MCP l'interdisent, et le connecteur ne lit le jeton que dans l'en-tête.

## Mise en service (après fusion de la PR)

Aucune de ces étapes n'a été faite : elles relèvent de l'administrateur du site.

1. **Générer un secret** d'au moins 32 caractères, par exemple : `openssl rand -hex 32`.
2. **Vercel → Settings → Environment Variables** (environnement Production) :
   - `TOUBA_INFOS_MCP_SECRET` = le secret ;
   - **changer `TI_ADMIN_PASSWORD`** pour un nouveau mot de passe de 12 caractères ou plus : l'ancien système le stockait en clair dans le cookie des navigateurs connectés, il doit donc être considéré comme exposé. Sans cette variable, ou avec une valeur par défaut (`change-me`, `touba-infos`…), la connexion à `/admin` est refusée en production ;
   - créer `TI_SESSION_SECRET` (`openssl rand -hex 32`), recommandé ;
   - vérifier que `TOUBA_INFOS_INTEGRATION_SECRET` (AMY) fait au moins 32 caractères ; sinon, le régénérer et le mettre à jour aussi côté AMY ;
   - vérifier que `TI_AGENT_AUTOPUBLISH` est absent ou vaut `off` (variable héritée, sans effet sur les intégrations).
3. **Redéployer** le site.
4. **Ajouter le connecteur dans Claude** : Customize → Connectors → Add custom connector (ou Organization settings → Connectors sur Team/Enterprise) :
   - **MCP server URL** : `https://toubainfos.com/api/touba-infos/mcp`
   - **Authentication** : *No sign-in*
   - **Request headers** : nom `authorization`, valeur `Bearer <le secret>` (le mot `Bearer` et l'espace sont obligatoires : Claude envoie la valeur telle quelle), **Required**.
5. **Tester** : demander à Claude de lister les brouillons, puis de créer un brouillon de test ; le vérifier puis le supprimer dans `/admin`.

### Claude Code

```bash
claude mcp add --transport http touba-infos-redaction \
  https://toubainfos.com/api/touba-infos/mcp \
  --header "Authorization: Bearer $TOUBA_INFOS_MCP_SECRET"
```

### API Claude

```json
"mcp_servers": [
  {
    "type": "url",
    "url": "https://toubainfos.com/api/touba-infos/mcp",
    "name": "touba-infos-redaction",
    "authorization_token": "<TOUBA_INFOS_MCP_SECRET>"
  }
]
```

L'API ajoute elle-même le préfixe `Bearer`. Le connecteur MCP de l'API exige un en-tête bêta (`anthropic-beta`), voir la documentation de l'API.

## Rotation et révocation du secret

- Une fuite du secret permet seulement de **créer des brouillons** et de **lire** les articles publiés et les brouillons IA. Elle ne permet ni de publier ni de supprimer.
- Pour révoquer : changer `TOUBA_INFOS_MCP_SECRET` sur Vercel et redéployer. Dans Claude, les en-têtes ne sont pas modifiables : supprimer le connecteur et le rajouter avec la nouvelle valeur.
- Supprimer la variable désactive totalement le connecteur (réponse 401).

## Dépannage

| Symptôme dans Claude | Cause probable |
| --- | --- |
| « Authorization with the MCP server failed » ou demande de connexion OAuth | En-tête `authorization` absent ou faux : le site répond 401 et Claude tente alors une découverte OAuth (`/.well-known/oauth-protected-resource`), qui n'existe pas. Vérifier la valeur `Bearer <secret>` (le connecteur doit être supprimé puis rajouté pour la changer). |
| « Couldn't reach the MCP server » | Site indisponible, URL erronée, ou variable `TOUBA_INFOS_MCP_SECRET` absente ou trop courte après déploiement. |
| Section « Request headers » absente | Fonctionnalité bêta non ouverte à votre compte (voir plus haut). |

## Sessions de l'espace rédaction

- Après déploiement, **tous les utilisateurs de `/admin` doivent se reconnecter une fois** (les anciens cookies sont refusés).
- La déconnexion efface le cookie du navigateur, mais une copie volée du cookie reste valable jusqu'à son expiration (8 h). Pour couper **toutes** les sessions immédiatement : changer `TI_SESSION_SECRET` ou `TI_ADMIN_PASSWORD` et redéployer.

## Sécurité côté serveur

| Contrôle | Détail |
| --- | --- |
| Authentification | Jeton dédié, ≥ 32 caractères, comparaison à temps constant ; 401 identique si non configuré |
| Origine | En-tête `Origin` d'un site tiers refusé (403) |
| Validation | Schémas stricts : tout champ inconnu (`statut`, `alaUne`, `publier`…) est refusé |
| Contenu | Texte converti en HTML sûr, liste blanche de balises, chevrons retirés des titres, tags, légendes |
| Images | Seules les images du stockage Touba Infos (`touba-infos/articles/`) ; les autres restent des suggestions |
| Débit | 300 appels/h, 30 brouillons/h, 60 requêtes/min par IP (par instance serveur) |
| Doublons | Clé d'idempotence, clé de contenu, même titre sous 72 h |
| Journaux | Identifiant de requête, outil, résultat ; jamais de jeton ni de contenu |
| Lecture | Articles publiés et brouillons IA uniquement (pas les brouillons de la rédaction ni les articles programmés) |

Les requêtes de Claude proviennent de l'infrastructure d'Anthropic (plage `160.79.104.0/21` d'après sa documentation). Un filtrage par adresse IP est possible en complément, mais il bloquerait Claude Code utilisé depuis un poste local ; il n'est donc pas activé.

## Vérification

- `npm test` : tests unitaires, d'intégration et audit des permissions.
- `npm run build && npm run test:mcp-e2e` : démarre le site compilé et le teste avec le **client officiel du SDK MCP** (authentification, initialisation, outils, brouillon, doublon, refus des opérations non autorisées, absence de publication).
- GitHub Actions (`.github/workflows/touba-infos-ci.yml`) exécute tout cela sur chaque PR.

## Sources

- [Add a connector that isn't in the directory — Authenticate with request headers](https://claude.com/docs/connectors/custom/add-unlisted)
- [Authentication for connectors — Static credentials in request headers](https://claude.com/docs/connectors/building/authentication)
- [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [MCP connector (API Claude)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
