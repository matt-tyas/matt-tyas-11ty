# Matt.Tyas.fyi

This project is based on the [Eleventyone starter created by Phil Hawksworth](https://github.com/philhawksworth/eleventyone).

[Eleventy](https://11ty.io) is very similar to jekyll the static site generator used in the old prototyping kit - however we're hoping this is far simpler to set up and use.

Included:

- [Eleventy](https://11ty.io) with a skeleton site
- A CSS pipeline with PostCSS
- An inline JS pipeline
- The Co-op foundations, elements and components ready to use
- [Browsersync](https://browsersync.io/) for testing


## Instructions

### Prerequisites
You'll need [Node.js](https://nodejs.org/) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed. When you run the next step these will be installed autoamtically, however on Co-op Macs you may not have permissions to do this. 

If you get an error:

1. Log out.
2. Log back in as the admin account.
3. Choose Apple menu > System Preferences.
4. Click Users & Groups.
5. Click the lock icon to unlock it, then enter an administrator name and password.
6. Select a standard user or managed user in the list of users, then select “Allow user to administer this computer.”
7. Log out of the admin account.
8. Log back in with your standard account.

### Running locally
In a terminal window navigate to the website folder. If you don't know how to do this open terminal and drag the folder into it. That will put terminal into the right place. Once there type:

```bash
# install the dependencies
npm install
```
And press enter. Then type:

```bash
# The site will then run locally
npm start
```
And press enter.

You should see the following URLs in your terminal window where you can access your website and the Browsersync dashboard:

```bash
[Browsersync] Access URLs:
 -------------------------------------
       Local: http://localhost:8080
    External: http://192.168.0.13:8080
 -------------------------------------
          UI: http://localhost:3001
 UI External: http://localhost:3001
 -------------------------------------
[Browsersync] Serving files from: dist
```
