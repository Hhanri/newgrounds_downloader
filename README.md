# Introduction
**newgrounds_downloader** is a CLI application that allows downloading videos from [Newgrounds](https://www.newgrounds.com/).

# Getting Started
1. clone the project
`git clone https://github.com/Hhanri/newgrounds_downloader`
2. install NPM packages
`npm install`
3. run the app
`npm run start`

# Configuration
<section id="configuration"></section>

To use the application, you will need to provide your credentials (email and password). 

There are 2 ways you can do it:
- type your email and password inside the console as you will be asked when running the application
- fill in the `credentials.json` inside `src/` folder by replacing `null`s with your email/password (the app will automatically reach for this file, therefore your will not need to type your email and password inside the console)



# How to use
There are 2 ways you can use this CLI application:

### Manual input
  1. run the application using `npm run start`
  2. type in your email and password if needed ([Configuration](#configuration))
  3. paste the link to the video you want to download

### Batch download
  1. run the app using `npm run start -- --file=[FILE_PATH]` where `[FILE_PATH]` is the path of the file containing the list of videos to download (example: `npm run start -- --file=batch.txt`)
  2. type in your email and password if needed ([Configuration](#configuration))
