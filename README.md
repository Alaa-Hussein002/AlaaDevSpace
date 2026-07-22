# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



```
AlaaDevSpace
├─ .env.production
├─ components.json
├─ eslint.config.js
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ avatar.jpg
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ src
│  ├─ AlaaDevSpace.code-workspace
│  ├─ api
│  │  ├─ axios.js
│  │  └─ services.js
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ 3d
│  │  ├─ admin
│  │  ├─ games
│  │  ├─ layout
│  │  │  ├─ AdminGuard.jsx
│  │  │  ├─ AdminLayout.jsx
│  │  │  ├─ AuthGuard.jsx
│  │  │  ├─ CustomerGuard.jsx
│  │  │  ├─ Footer.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  └─ PublicLayout.jsx
│  │  ├─ portfolio
│  │  │  ├─ AcademicJourney.jsx
│  │  │  ├─ ExperienceTimeline.jsx
│  │  │  └─ SkillsShowcase.jsx
│  │  ├─ SEO.jsx
│  │  ├─ SkeletonLoader.jsx
│  │  ├─ store
│  │  └─ ui
│  │     ├─ avatar.jsx
│  │     ├─ badge.jsx
│  │     ├─ button.jsx
│  │     ├─ card.jsx
│  │     ├─ checkbox.jsx
│  │     ├─ dialog.jsx
│  │     ├─ dropdown-menu.jsx
│  │     ├─ favorite-button.jsx
│  │     ├─ image-upload.jsx
│  │     ├─ input.jsx
│  │     ├─ label.jsx
│  │     ├─ scroll-area.jsx
│  │     ├─ select.jsx
│  │     ├─ separator.jsx
│  │     ├─ sheet.jsx
│  │     ├─ SmartIcon.jsx
│  │     ├─ sonner.jsx
│  │     ├─ switch.jsx
│  │     ├─ table.jsx
│  │     ├─ tabs.jsx
│  │     └─ textarea.jsx
│  ├─ hooks
│  │  └─ useSEO.js
│  ├─ index.css
│  ├─ lib
│  │  └─ utils.js
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ admin
│  │  │  ├─ AdminAcademic.jsx
│  │  │  ├─ AdminArticles.jsx
│  │  │  ├─ AdminCoupons.jsx
│  │  │  ├─ AdminCustomers.jsx
│  │  │  ├─ AdminExperiences.jsx
│  │  │  ├─ AdminGames.jsx
│  │  │  ├─ AdminMessages.jsx
│  │  │  ├─ AdminOrders.jsx
│  │  │  ├─ AdminPayments.jsx
│  │  │  ├─ AdminProducts.jsx
│  │  │  ├─ AdminProfile.jsx
│  │  │  ├─ AdminProjects.jsx
│  │  │  ├─ AdminSettings.jsx
│  │  │  ├─ AdminSkills.jsx
│  │  │  ├─ AdminTestimonials.jsx
│  │  │  ├─ AdminUsers.jsx
│  │  │  ├─ ArticleEditor.jsx
│  │  │  └─ Dashboard.jsx
│  │  ├─ auth
│  │  │  ├─ ForgotPassword.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ ResetPassword.jsx
│  │  │  └─ VerifyOtp.jsx
│  │  ├─ customer
│  │  │  ├─ Checkout.jsx
│  │  │  ├─ CustomerCart.jsx
│  │  │  ├─ Favorites.jsx
│  │  │  └─ MyOrders.jsx
│  │  ├─ placeholder.jsx
│  │  └─ public
│  │     ├─ ArticleDetails.jsx
│  │     ├─ Articles.jsx
│  │     ├─ Contact.jsx
│  │     ├─ Games.jsx
│  │     ├─ Home.jsx
│  │     ├─ ProductDetails.jsx
│  │     ├─ ProjectDetails.jsx
│  │     ├─ Projects.jsx
│  │     └─ Store.jsx
│  ├─ store
│  │  ├─ authStore.js
│  │  ├─ cartStore.js
│  │  └─ favoritesStore.js
│  └─ styles
├─ vercel.json
└─ vite.config.js

```
