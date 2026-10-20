# EAZ Electrical website

Website and Firebase enquiry backend for EAZ Electrical, Melbourne.

## Pages

- Home, Services, Projects, About, Contact and Privacy
- Responsive layout with placeholders for Eli's portrait, logo and project before/after photos
- Contact form with optional photo uploads

## Local build

Use Node.js 22 or later:

```sh
node build.mjs
node preview.mjs
```

The preview is available at `http://127.0.0.1:4173`. The contact form requires the Firebase backend; it cannot submit to the local static preview.

## Firebase deployment

This project uses Firebase Hosting, a second-generation Cloud Function in Melbourne, Cloud Firestore and Cloud Storage. Functions and Storage require the Firebase Blaze plan. The form stores enquiries in the `enquiries` Firestore collection, with private photos under `enquiries/<id>/` in the default Storage bucket. Client access to those records is denied by the checked-in security rules. The owner can read enquiries in the Firebase console. Email notifications are not enabled yet.

After selecting the Firebase project and provisioning the Firestore database and default Storage bucket in Melbourne, install the functions dependencies and deploy:

```sh
cd functions && pnpm install && cd ..
node build.mjs
firebase deploy --only firestore:rules,storage,functions,hosting
```

Do not commit service-account credentials or email-sending secrets. When photos, logo or reviews are provided, replace the visual placeholders and update project stories with the actual details. Air-conditioning installation is intentionally omitted from the current services list until its licence status is confirmed.

## Form behavior

The form accepts a name, phone, suburb, preferred contact time, job description and up to four JPG, PNG or WebP photos of 5 MB each. The Cloud Function validates content and limits repeated submissions from the same network. If the backend is unavailable, the page displays Eli's phone and email as alternatives.
