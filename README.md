<h1 align="center">
  <br>
  <a href="https://github.com/athanasiosem/betterread">
  <img src="images/logo128.png"/><br/>
  betterread
  </a>
</h1>

<h4 align="center">Simple Chrome/Edge extension that changes the CSS style of a website for better reading experience.</h4>

<p align="center">
<a href="https://github.com/athanasiosem/betterread/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-red.svg"></a>
<a href="https://github.com/athanasiosem/betterread/issues"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"></a>
<a href="https://github.com/athanasiosem/betterread/releases"><img src="https://img.shields.io/github/release/athanasiosem/betterread">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a>
</p>

# Features
betterread is a simple Chrome/Edge extension that changes the CSS style of a website for better reading experience. 
The extension is useful when browsing sites that:
- have all their body layout left-aligned,
- have small fonts, 
- have no or little line-height 
- have more than 80 characters long sentences. 

### SPECIAL NOTE: The extension takes a general approach and is not always site specific, therefore, it will not work on all websites. Where it shines are old webpages that are not designed for readability.

## Site-specific rules
For supported sites, betterread applies tailored CSS instead of the generic defaults. The on/off state is remembered **per site** — toggling on Reddit does not affect Hacker News, and vice versa. State also persists across page navigations and browser restarts.

**Currently supported sites:**
| Site | Notes |
|---|---|
| Reddit (`reddit.com`) | Custom styles for post and comment readability |
| Hacker News (`news.ycombinator.com`) | Improved layout and font sizing |

All other sites fall back to the generic CSS. Adding support for a new site requires only a new entry in `SITE_RULES` (in `js/background.js`) and a corresponding CSS file under `css/sites/`.

# Installation
At this time, you can only install the extension from its source. First of all, [download the extension zip file](https://github.com/athanasiosem/betterread/archive/refs/tags/v1.0.0.zip). After you have downloaded the file, unzip it to a destination of your choice. Next, open the "Extensions" page (chrome://extensions/) in the browser and turn on the "Developer mode".
Click on the "Load unpacked" button and select the directory where you unzipped the extension. The betterread extension is now installed.

# Usage
To use the extension just click on the extension icon to toggle it on or off.

![screen_capture](https://github.com/athanasiosem/betterread/blob/main/images/screencap.gif?raw=true)

# Tested websites
Here is a list of websites the extension has been tested to work.

- https://news.ycombinator.com
- https://www.reddit.com
- https://man7.org/linux/man-pages

<div align="center">
Athanasios Emmanouilidis - MIT License
</div>
