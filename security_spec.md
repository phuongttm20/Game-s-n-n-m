# Security Specification — Bramble: The Mosswood Trail

## 1. Data Invariants
- Only verified Google/Gmail-authenticated users (`request.auth != null && request.auth.token.email_verified == true`) may access their own `/playerProfiles/{userId}` document.
- A player may only read (`get`), create, or update their own `/playerProfiles/{userId}` document where `userId == request.auth.uid` and `incoming().uid == request.auth.uid`.
- Collection-wide `list` and `delete` operations on `/playerProfiles` are strictly denied.
- `bestStageAcorns` must always be a 3-element list of integers where each entry is between `0` and `12`.
- `highestStageUnlocked` must be an integer between `0` and `2`.
- `updatedAt` must always equal `request.time`.
- `uid` is immutable after creation (`incoming().uid == existing().uid`).

## 2. Dirty Dozen Adversarial Payloads
1. Unauthenticated `get` on `/playerProfiles/user_1` -> `PERMISSION_DENIED`
2. Unverified email (`email_verified: false`) `create` on `/playerProfiles/user_1` -> `PERMISSION_DENIED`
3. Cross-user `get` (`auth.uid = 'user_2'` reading `/playerProfiles/user_1`) -> `PERMISSION_DENIED`
4. Cross-user `create` (`auth.uid = 'user_2'` writing `/playerProfiles/user_1`) -> `PERMISSION_DENIED`
5. Identity spoofing (`auth.uid = 'user_1'`, payload `uid: 'user_2'`) -> `PERMISSION_DENIED`
6. Invalid document ID (`userId = 'user$1/../../admin'`) -> `PERMISSION_DENIED`
7. Shadow field injection (`extraAdmin: true`) -> `PERMISSION_DENIED`
8. Unbounded array (`bestStageAcorns: [1,2,3,4]`) -> `PERMISSION_DENIED`
9. Out-of-range acorn count (`bestStageAcorns: [999, 0, 0]`) -> `PERMISSION_DENIED`
10. Out-of-range stage unlock (`highestStageUnlocked: 99`) -> `PERMISSION_DENIED`
11. Forged client timestamp (`updatedAt: "2020-01-01T00:00:00Z"`) -> `PERMISSION_DENIED`
12. Collection scraping (`list` on `/playerProfiles`) -> `PERMISSION_DENIED`
