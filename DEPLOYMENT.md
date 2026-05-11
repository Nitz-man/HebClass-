# HebClass Render Deployment

HebClass deploys as one Render Node web service. The Express backend serves the API and the built React frontend.

## Before Deploy

1. Push this repository to a new GitHub repo named `HebClass`.
2. Make sure `render.yaml` is at the repo root.
3. Do not commit local runtime data from `backend/data/db.json`; it is ignored.

## Deploy On Render

1. Open Render.
2. Choose **New +**.
3. Choose **Blueprint**.
4. Connect the new `HebClass` GitHub repository.
5. Render will detect `render.yaml`.
6. Confirm creation of the `hebclass` web service.
7. Deploy.

Render will create:

- Node web service: `hebclass`
- Persistent disk: `hebclass-data`
- `NODE_ENV=production`
- `DATA_DIR=/var/data`
- Generated `JWT_SECRET`

## After Deploy

Open the generated `*.onrender.com` URL and test:

```text
username: itay
password: password123
```

Then test:

- Dashboard loads
- Avatar picker works
- Continue learning opens a game
- Completing a lesson returns to dashboard and updates progress
- Generated music plays from the bottom music control

## Optional Custom Domain

In the Render service dashboard:

1. Go to **Settings**.
2. Add your custom domain.
3. Follow Render's DNS instructions.
4. Wait for HTTPS certificate provisioning.
