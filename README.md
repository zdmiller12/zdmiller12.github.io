# Orka

## Creation Steps

> Mostly following https://github.com/gitname/react-gh-pages

npm -v 10.9.2
node -v v18.20.5

1. npx create-next-app@latest

    create-next-app@15.1.6

    ✔ What is your project named? … orka
    ✔ Would you like to use TypeScript? … Yes
    ✔ Would you like to use ESLint? … Yes
    ✔ Would you like to use Tailwind CSS? … Yes
    ✔ Would you like your code inside a `src/` directory? … Yes
    ✔ Would you like to use App Router? (recommended) … Yes
    ✔ Would you like to use Turbopack for `next dev`? … Yes
    ✔ Would you like to customize the import alias (`@/*` by default)? … No

    Initializing project with template: app-tw

2. `cd orka`
2. `npm install gh-pages --save-dev`
3. Edit `package.json`
    - add **homepage** 
    - add **predeploy** script
    - add **deploy** script (*with `.next` substituted for `build` in the instructions*)
