<p align="center"><img width="150" height="150" src="./public/logo.svg"></p>

<h1 align="center">Aqua Toolkit</h1>

<p align="center"><img alt="GitHub" src="https://img.shields.io/github/license/SZTU-ACM/aqua-toolkit"> <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/SZTU-ACM/aqua-toolkit"> <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/SZTU-ACM/aqua-toolkit"></p>

<p align="center">An All-in-one Toolkit for XCPC Contests</p>

<h2 align="center">🚧 Project is now refactoring, pls wait for next major version 🚧</h2>

## Features

1. Seats generator
2. Dynamic rank
3. Resolver

## Build

1. Clone this repo
```bash
git clone git@github.com:SZTU-ACM/aqua-toolkit.git
```

2. Install node modules
```bash
pnpm install
# You can use npm or yarn instead
```

3. Run build
```bash
pnpm run build
```

4. Distribution files are in "dist" folder
```bash
cd dist/
ls -la
```

## Deploy

It is pretty easy to deply, just find a static site engine, copy distribution files into static folder, then start your engine.

Aqua Toolkit is just a static single page application