This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
public/
  favicon.svg
  icons.svg
  logo.jpeg
src/
  assets/
    hero.png
    react.svg
    vite.svg
  App.css
  App.tsx
  index.css
  main.tsx
.gitignore
eslint.config.js
index.html
package.json
README.md
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
````

# Files

## File: public/favicon.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/><mask id="a" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z" style="fill:#000;fill-opacity:1"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -32.644 -3.334)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -34.34 30.47)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(39.51 .387 8.972)"/></g><g filter="url(#k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 47.523 -6.092)"/></g><g filter="url(#l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 41.412 6.333)"/></g><g filter="url(#m)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#n)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#o)"><ellipse cx="35.651" cy="29.907" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 35.651 29.907)"/></g><g filter="url(#p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 38.418 32.4)"/></g></g><defs><filter id="b" width="60.045" height="41.654" x="-19.77" y="16.149" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-54.613" y="-7.533" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-49.64" y="2.03" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-45.045" y="20.029" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-43.513" y="21.178" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="15.756" y="-17.901" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-27.636" y="-22.853" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="20.116" y="-38.415" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="24.641" y="-11.323" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="8.244" y="-2.416" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="18.713" y="10.588" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter></defs></svg>
````

## File: public/icons.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="bluesky-icon" viewBox="0 0 16 17">
    <g clip-path="url(#bluesky-clip)"><path fill="#08060d" d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099"/></g>
    <defs><clipPath id="bluesky-clip"><path fill="#fff" d="M.1.85h15.3v15.3H.1z"/></clipPath></defs>
  </symbol>
  <symbol id="discord-icon" viewBox="0 0 20 19">
    <path fill="#08060d" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
  </symbol>
  <symbol id="documentation-icon" viewBox="0 0 21 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="m15.5 13.333 1.533 1.322c.645.555.967.833.967 1.178s-.322.623-.967 1.179L15.5 18.333m-3.333-5-1.534 1.322c-.644.555-.966.833-.966 1.178s.322.623.966 1.179l1.534 1.321"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M17.167 10.836v-4.32c0-1.41 0-2.117-.224-2.68-.359-.906-1.118-1.621-2.08-1.96-.599-.21-1.349-.21-2.848-.21-2.623 0-3.935 0-4.983.369-1.684.591-3.013 1.842-3.641 3.428C3 6.449 3 7.684 3 10.154v2.122c0 2.558 0 3.838.706 4.726q.306.383.713.671c.76.536 1.79.64 3.581.66"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M3 10a2.78 2.78 0 0 1 2.778-2.778c.555 0 1.209.097 1.748-.047.48-.129.854-.503.982-.982.145-.54.048-1.194.048-1.749a2.78 2.78 0 0 1 2.777-2.777"/>
  </symbol>
  <symbol id="github-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
  </symbol>
  <symbol id="social-icon" viewBox="0 0 20 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M12.5 6.667a4.167 4.167 0 1 0-8.334 0 4.167 4.167 0 0 0 8.334 0"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M2.5 16.667a5.833 5.833 0 0 1 8.75-5.053m3.837.474.513 1.035c.07.144.257.282.414.309l.93.155c.596.1.736.536.307.965l-.723.73a.64.64 0 0 0-.152.531l.207.903c.164.715-.213.991-.84.618l-.872-.52a.63.63 0 0 0-.577 0l-.872.52c-.624.373-1.003.094-.84-.618l.207-.903a.64.64 0 0 0-.152-.532l-.723-.729c-.426-.43-.289-.864.306-.964l.93-.156a.64.64 0 0 0 .412-.31l.513-1.034c.28-.562.735-.562 1.012 0"/>
  </symbol>
  <symbol id="x-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/>
  </symbol>
</svg>
````

## File: src/assets/react.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
````

## File: src/assets/vite.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>
````

## File: src/App.css
````css
:root {
    --primary: #01696f;
    --primary-light: #018a91;
    --accent: #f0f9fa;
    --text-main: #1a1a1a;
    --text-muted: #4a5568;
    --border-color: rgba(0,0,0,0.15);
    --bg-shell: #f4f7f8;
    --bg-bill: #ffffff;
    --danger: #c0392b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: var(--bg-shell);
    color: var(--text-main);
    line-height: 1.5;
}

/* ==================== TOOLBAR ==================== */
.toolbar {
    position: sticky;
    top: 0;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    flex-wrap: wrap;
    gap: 10px;
}
.toolbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--primary);
}
.toolbar-brand svg { width: 22px; height: 22px; fill: var(--primary); }
.action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-light); }
.btn-secondary { background: white; color: var(--primary); border: 1px solid var(--primary); }
.btn-secondary:hover { background: var(--accent); }
.btn-danger { background: white; color: var(--danger); border: 1px solid var(--danger); }
.btn-danger:hover { background: #fdf2f2; }

/* ==================== APP SHELL ==================== */
.app-shell {
    padding: 30px 16px;
    display: flex;
    justify-content: center;
}

/* ==================== BILL ==================== */
/*
 * IMPORTANT: height is set to exactly 1123px (A4 at 96dpi).
 * This is intentional — it ensures the flex spacer (.bill-spacer)
 * can stretch to fill the remaining space and push .signatures-section
 * to the bottom of the page at all times, regardless of how many
 * procedure rows are filled in.
 * Do NOT change this to min-height or auto.
 */
.bill-container {
    background: var(--bg-bill);
    width: 794px;
    height: 1123px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border-radius: 4px;
    padding: 36px 44px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Header */
.bill-header { text-align: center; margin-bottom: 12px; }
.clinic-name {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
    line-height: 1.15;
}
.header-details {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.clinic-logo {
    width: 90px;
    height: 90px;
    object-fit: contain;
}
.doctor-info { text-align: left; }
.doctor-name { font-weight: 700; font-size: 1.05rem; margin-bottom: 1px; }
.doctor-title { font-size: 0.85rem; color: var(--text-muted); }

.header-right { text-align: right; }
.contact-info { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
.consulting-hours { font-size: 0.78rem; color: var(--text-muted); line-height: 1.35; }
.appointment-label {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 0.72rem;
    font-weight: 600;
    margin-top: 4px;
}

.bill-divider {
    border: none;
    border-top: 2px solid var(--primary);
    margin: 12px 0;
    opacity: 0.5;
}
.services-strip {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: #01696f;
  padding: 6px 16px;
  line-height: 1.7;
  width: 100%;
  box-sizing: border-box;
  word-break: keep-all;       /* CRITICAL: prevents mid-word line breaks */
  overflow-wrap: normal;      /* do not force-break long words */
  white-space: normal;
}

.bill-header,
.services-strip-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.address-line {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 20px;
}

/* Form area — flex column so spacer stretches to fill remaining height */
.bill-form {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;   /* required for flex children to shrink/grow correctly */
}

.bill-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    font-weight: 600;
    font-size: 0.95rem;
}

.input-inline {
    border: none;
    border-bottom: 1px dashed var(--border-color);
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: var(--text-main);
    padding: 2px 4px;
    outline: none;
    transition: border-color 0.2s;
}
.input-inline:focus {
    border-bottom-color: var(--primary);
    background: var(--accent);
}
.input-inline::placeholder { color: #cbd5e0; font-weight: 400; }

.bill-no-input { width: 100px; }
.date-input { width: 140px; font-family: 'Inter', sans-serif; }

.patient-info {
  display: block;        /* NOT flex — use inline flow so text wraps naturally */
  line-height: 1.9;
  white-space: normal;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.patient-info input {
  display: inline-block;
  vertical-align: baseline;
}

.patient-name-input {
  width: auto;
  min-width: 80px;
  max-width: 340px;
  display: inline-block;
  box-sizing: content-box;
  font-weight: 500;
}
.age-input { width: 50px; text-align: center; }

.procedures-section { margin-bottom: 20px; }
.procedure-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    white-space: nowrap;
}
.procedure-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}
.procedure-left span { flex-shrink: 0; font-weight: 500; }
.proc-number {
    visibility: hidden;
    width: 20px;
    flex-shrink: 0;
}
.procedure-name-input { flex: 1; min-width: 0; }
.procedure-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-left: 12px;
}
.procedure-right label { font-weight: 500; flex-shrink: 0; }
.procedure-date-input { width: 120px; }

.amount-section {
    line-height: 2;
    font-size: 0.95rem;
    flex-shrink: 0;
}
.amount-input {
    width: 120px;
    font-weight: 600;
    text-align: right;
}

/*
 * SPACER — this is the key element that pushes signatures to the bottom.
 * flex: 1 means it grows to fill ALL remaining vertical space between
 * the procedures section and the amount/signature sections.
 * flex-shrink: 0 prevents it from collapsing when content is heavy.
 * min-height: 20px ensures there is always at least a small gap.
 */
.bill-spacer {
    flex: 1;
    flex-shrink: 0;
    min-height: 20px;
}

.signatures-section {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    flex-shrink: 0;
}
.signature-box { text-align: center; }
.signature-line {
    width: 180px;
    border-top: 1px solid var(--text-main);
    margin-bottom: 6px;
}
.signature-label { font-weight: 600; font-size: 0.9rem; }

#patientName,
#patientAge,
#amount {
    border-bottom: 1px solid #000000;
}

/* ==================== PRINT ==================== */
@media print {
    @page {
        size: A4 portrait;
        margin: 10mm 15mm;
    }

    html, body {
        width: 210mm;
        height: 297mm;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        overflow: hidden;
    }

    .toolbar {
        display: none !important;
    }

    .app-shell {
        padding: 0 !important;
        display: block !important;
        background: white !important;
    }

    .bill-container {
        width: 180mm !important;
        height: 277mm !important;
        max-width: none !important;
        min-height: unset !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 8mm 10mm !important;
        margin: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        font-size: 11pt !important;
    }

    .clinic-name {
        font-size: 22pt !important;
    }
    .doctor-name { font-size: 11pt !important; }
    .doctor-title { font-size: 9.5pt !important; }
    .contact-info { font-size: 10pt !important; }
    .consulting-hours { font-size: 8.5pt !important; }
    .appointment-label { font-size: 8pt !important; }
    .services-strip { font-size: 8pt !important; line-height: 1.4 !important; }
    .address-line { font-size: 9pt !important; margin-bottom: 8px !important; }
    .patient-info { font-size: 11pt !important; }
    .signature-label { font-size: 10pt !important; }

    .bill-form {
        display: flex !important;
        flex-direction: column !important;
        flex: 1 !important;
        min-height: 0 !important;
        overflow: hidden !important;
    }

    /* Spacer fills remaining height — signatures always at bottom */
    .bill-spacer {
        flex: 1 !important;
        min-height: 0 !important;
        flex-shrink: 1 !important;
    }

    .header-details {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
    }
    .header-left {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
    }
    .header-right { text-align: right !important; }

    .procedure-row {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: center !important;
        white-space: nowrap !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        font-size: 11pt !important;
    }
    .bill-meta {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        font-size: 11pt !important;
    }
    .amount-section {
        margin-top: 0 !important;
        padding-top: 4mm !important;
        font-size: 11pt !important;
        flex-shrink: 0 !important;
    }
    .signatures-section {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        margin-top: 6mm !important;
        padding-top: 0 !important;
        flex-shrink: 0 !important;
    }
    .input-inline {
        border: none !important;
        border-bottom: 1px solid transparent !important;
        background: transparent !important;
        -webkit-appearance: none;
        appearance: none;
        font-size: 11pt !important;
    }
    .bill-divider { margin: 8px 0 !important; }
    .procedure-row.row-empty {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
    #patientName,
    #patientAge,
    #amount {
        border-bottom: 1px solid #000000 !important;
    }
}

/* ==================== RESPONSIVE ==================== */
@media screen and (max-width: 820px) {
    .bill-container {
        width: 100%;
        height: auto;
        min-height: 100vh;
        padding: 20px 16px;
        border-radius: 0;
    }
    .app-shell { padding: 10px 0; }
    .clinic-name { font-size: 1.6rem; }
    .header-details { flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .header-left { flex-direction: column; text-align: center; }
    .header-right { text-align: center; }
    .doctor-info { text-align: center; }
    .procedure-row { flex-wrap: wrap; white-space: normal; }
    .procedure-right { margin-left: 20px; }
    .signatures-section { flex-direction: column; gap: 30px; align-items: center; }
    .toolbar { flex-direction: column; align-items: stretch; }
    .action-buttons { justify-content: center; }
}
````

## File: src/App.tsx
````typescript
import { useEffect, useRef } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
    const billRef = useRef<HTMLDivElement>(null);

    const autoResizeInput = (input: HTMLInputElement) => {
        // Create a hidden measurer span that mimics the input's font
        const measurer = document.createElement('span');
        measurer.style.cssText = `
            visibility: hidden;
            position: absolute;
            white-space: pre;
            font-size: ${getComputedStyle(input).fontSize};
            font-family: ${getComputedStyle(input).fontFamily};
            font-weight: ${getComputedStyle(input).fontWeight};
            letter-spacing: ${getComputedStyle(input).letterSpacing};
        `;
        measurer.textContent = input.value || input.placeholder;
        document.body.appendChild(measurer);
        const width = measurer.getBoundingClientRect().width;
        document.body.removeChild(measurer);
        input.style.width = `${Math.max(80, Math.ceil(width) + 10)}px`;
    };

    const getBase64Image = (url: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                } else {
                    resolve(url);
                }
            };
            img.onerror = () => resolve(url);
            img.src = url + '?t=' + Date.now();
        });
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('billDate') as HTMLInputElement;
        if (dateInput) {
            dateInput.value = today;
        }
        const nameInput = document.getElementById('patientName') as HTMLInputElement;
        if (nameInput) autoResizeInput(nameInput);
    }, []);

    const updateEmptyRowClasses = () => {
        for (let i = 1; i <= 10; i++) {
            const row = document.getElementById(`procedure-row-${i}`);
            const nameInput = document.getElementById(`proc${i}Name`) as HTMLInputElement | null;
            const dateInput = document.getElementById(`proc${i}Date`) as HTMLInputElement | null;
            if (!row) continue;
            const nameEmpty = !nameInput?.value?.trim();
            const dateEmpty = !dateInput?.value?.trim();
            if (nameEmpty && dateEmpty) {
                row.classList.add('row-empty');
            } else {
                row.classList.remove('row-empty');
            }
        }
    };

    const handlePrint = () => {
        updateEmptyRowClasses();
        window.print();
    };

    const downloadPDF = async () => {
        const bill = billRef.current;
        if (!bill) return;

        const rawDate = (document.getElementById('billDate') as HTMLInputElement)?.value || '';
        const date = rawDate ? rawDate.split('-').reverse().join('-') : 'Date';

        // ─── Track injected spans / hidden inputs for cleanup ───
        const allProcRows: HTMLElement[] = [];
        const rowWasHidden: boolean[] = [];
        let logoImg: HTMLImageElement | null = null;
        let origLogoSrc = '';
        let billDateInput: HTMLInputElement | null = null;
        const procDateInputs: HTMLInputElement[] = [];
        const procFormattedSpans: HTMLSpanElement[] = [];

        // ─── Inject formatted bill-date span ───
        billDateInput = document.getElementById('billDate') as HTMLInputElement | null;
        const formattedSpan = document.createElement('span');
        formattedSpan.id = 'billDateFormatted';
        formattedSpan.style.cssText = 'font-size:inherit;color:inherit;font-family:inherit;';
        formattedSpan.textContent = date;
        if (billDateInput?.parentNode) {
            billDateInput.parentNode.insertBefore(formattedSpan, billDateInput.nextSibling);
            billDateInput.style.display = 'none';
        }

        // ─── Inject formatted procedure-date spans ───
        for (let i = 1; i <= 10; i++) {
            const procDateInput = document.getElementById(`proc${i}Date`) as HTMLInputElement | null;
            if (!procDateInput) continue;
            const rawProcDate = procDateInput.value || '';
            if (!rawProcDate) {
                procDateInputs.push(procDateInput);
                procFormattedSpans.push(document.createElement('span'));
                continue;
            }
            const formattedProcDate = rawProcDate.split('-').reverse().join('-');
            const procSpan = document.createElement('span');
            procSpan.className = 'proc-date-formatted';
            procSpan.style.cssText = 'font-size:inherit;color:inherit;font-family:inherit;font-weight:inherit;';
            procSpan.textContent = formattedProcDate;
            procDateInput.parentNode?.insertBefore(procSpan, procDateInput.nextSibling);
            procDateInput.style.display = 'none';
            procDateInputs.push(procDateInput);
            procFormattedSpans.push(procSpan);
        }

        // ─── Convert logo to base64 ───
        logoImg = bill.querySelector('.clinic-logo') as HTMLImageElement | null;
        origLogoSrc = logoImg?.src || '';
        if (logoImg) {
            const base64src = await getBase64Image('/logo.jpeg');
            logoImg.src = base64src;
            await new Promise<void>((resolve) => {
                if (logoImg!.complete) { resolve(); return; }
                logoImg!.onload = () => resolve();
                logoImg!.onerror = () => resolve();
            });
        }

        // ─── Wait for all images ───
        const images = Array.from(bill.querySelectorAll('img'));
        await Promise.all(images.map((img) => new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) { resolve(); return; }
            img.onload = () => resolve();
            img.onerror = () => resolve();
        })));

        window.scrollTo(0, 0);

        // ─── Hide toolbar ───
        const toolbar = document.querySelector('.toolbar') as HTMLElement | null;
        const origToolbarDisplay = toolbar?.style.display || '';
        if (toolbar) toolbar.style.display = 'none';

        // ─── Mark & hide empty procedure rows ───
        updateEmptyRowClasses();
        for (let i = 1; i <= 10; i++) {
            const row = document.getElementById(`procedure-row-${i}`) as HTMLElement | null;
            if (!row) continue;
            allProcRows.push(row);
            if (row.classList.contains('row-empty')) {
                rowWasHidden.push(true);
                row.style.display = 'none';
                row.style.height = '0';
                row.style.margin = '0';
                row.style.padding = '0';
                row.style.overflow = 'hidden';
            } else {
                rowWasHidden.push(false);
            }
        }

        // ─── Save original bill styles ───
        const origStyles = {
            position: bill.style.position,
            left: bill.style.left,
            top: bill.style.top,
            margin: bill.style.margin,
            width: bill.style.width,
            minWidth: bill.style.minWidth,
            maxWidth: bill.style.maxWidth,
            boxSizing: bill.style.boxSizing,
            height: bill.style.height,
            minHeight: bill.style.minHeight,
            boxShadow: bill.style.boxShadow,
            borderRadius: bill.style.borderRadius,
            zIndex: bill.style.zIndex,
            overflow: bill.style.overflow,
        };

        // ─── A4 at 96 dpi ───
        const A4_H = 1123;

        // ─── Lock bill to exact A4 dimensions for capture ───
        // Both width AND height are fixed so html2canvas captures
        // exactly one full A4 page with no blank bottom space.
        // Removed position: fixed, left, top, margin to prevent visual jump
        bill.style.width = '794px';
        bill.style.minWidth = '794px';
        bill.style.maxWidth = '794px';
        bill.style.boxSizing = 'border-box';
        bill.style.height = `${A4_H}px`;
        bill.style.minHeight = `${A4_H}px`;
        bill.style.boxShadow = 'none';
        bill.style.borderRadius = '0';
        bill.style.zIndex = '9999';
        bill.style.overflow = 'hidden';

        // ─── Force flex on key layout elements ───
        const headerDetails = bill.querySelector('.header-details') as HTMLElement | null;
        const headerLeft = bill.querySelector('.header-left') as HTMLElement | null;
        const sigSection = bill.querySelector('.signatures-section') as HTMLElement | null;
        const billMeta = bill.querySelector('.bill-meta') as HTMLElement | null;
        const billForm = bill.querySelector('.bill-form') as HTMLElement | null;
        const origHDDisplay = headerDetails?.style.display || '';
        const origHDFlexDir = headerDetails?.style.flexDirection || '';
        const origHDJustify = headerDetails?.style.justifyContent || '';
        const origHLDisplay = headerLeft?.style.display || '';
        const origHLAlign = headerLeft?.style.alignItems || '';
        const origSigDisplay = sigSection?.style.display || '';
        const origSigJustify = sigSection?.style.justifyContent || '';
        const origBMDisplay = billMeta?.style.display || '';
        const origFormDisplay = billForm?.style.display || '';
        const origFormFlex = billForm?.style.flex || '';
        const origFormFlexDir = billForm?.style.flexDirection || '';

        if (headerDetails) {
            headerDetails.style.display = 'flex';
            headerDetails.style.flexDirection = 'row';
            headerDetails.style.justifyContent = 'space-between';
            headerDetails.style.alignItems = 'flex-start';
        }
        if (headerLeft) {
            headerLeft.style.display = 'flex';
            headerLeft.style.flexDirection = 'row';
            headerLeft.style.alignItems = 'center';
            headerLeft.style.gap = '12px';
        }
        if (sigSection) {
            sigSection.style.display = 'flex';
            sigSection.style.flexDirection = 'row';
            sigSection.style.justifyContent = 'space-between';
            sigSection.style.alignItems = 'flex-start';
            sigSection.style.flexShrink = '0';
        }
        if (billMeta) {
            billMeta.style.display = 'flex';
            billMeta.style.flexDirection = 'row';
            billMeta.style.justifyContent = 'space-between';
        }
        // CRITICAL: bill-form must be flex column with flex:1 so the
        // .bill-spacer can grow and push signatures to the bottom.
        if (billForm) {
            billForm.style.display = 'flex';
            billForm.style.flexDirection = 'column';
            billForm.style.flex = '1';
        }

        const procedureRows = Array.from(bill.querySelectorAll('.procedure-row')) as HTMLElement[];
        const origProcRowStyles = procedureRows.map((row) => ({
            display: row.style.display,
            flexDirection: row.style.flexDirection,
            justifyContent: row.style.justifyContent,
            alignItems: row.style.alignItems,
        }));
        procedureRows.forEach((row) => {
            row.style.display = 'flex';
            row.style.flexDirection = 'row';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
        });

        // ─── Set spacer to flex:1 so it fills remaining A4 height ───
        const billSpacer = bill.querySelector('.bill-spacer') as HTMLElement | null;
        const origSpacerFlex = billSpacer?.style.flex || '';
        const origSpacerMinHeight = billSpacer?.style.minHeight || '';
        const origSpacerHeight = billSpacer?.style.height || '';

        if (billSpacer) {
            billSpacer.style.flex = '1';
            billSpacer.style.minHeight = '0';
            billSpacer.style.height = 'auto';
        }

        // ─── Hide input styling for clean capture ───
        const inputs = bill.querySelectorAll('input');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedInputStyles: any[] = [];
        inputs.forEach((inp) => {
            savedInputStyles.push({ borderBottom: inp.style.borderBottom, background: inp.style.background });
            if (inp.id === 'patientName' || inp.id === 'patientAge' || inp.id === 'amount') {
                inp.style.borderBottom = '1px solid #000000';
            } else {
                inp.style.borderBottom = '1px solid transparent';
            }
            inp.style.background = 'transparent';
        });

        // Wait two frames for layout to fully settle
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // ─── Restore all styles after capture ───
        const restoreStyles = () => {
            bill.style.position = origStyles.position;
            bill.style.left = origStyles.left;
            bill.style.top = origStyles.top;
            bill.style.margin = origStyles.margin;
            bill.style.width = origStyles.width;
            bill.style.minWidth = origStyles.minWidth;
            bill.style.maxWidth = origStyles.maxWidth;
            bill.style.boxSizing = origStyles.boxSizing;
            bill.style.height = origStyles.height;
            bill.style.minHeight = origStyles.minHeight;
            bill.style.boxShadow = origStyles.boxShadow;
            bill.style.borderRadius = origStyles.borderRadius;
            bill.style.zIndex = origStyles.zIndex;
            bill.style.overflow = origStyles.overflow;

            if (headerDetails) {
                headerDetails.style.display = origHDDisplay;
                headerDetails.style.flexDirection = origHDFlexDir;
                headerDetails.style.justifyContent = origHDJustify;
                headerDetails.style.alignItems = '';
            }
            if (headerLeft) {
                headerLeft.style.display = origHLDisplay;
                headerLeft.style.alignItems = origHLAlign;
                headerLeft.style.flexDirection = '';
                headerLeft.style.gap = '';
            }
            if (sigSection) {
                sigSection.style.display = origSigDisplay;
                sigSection.style.justifyContent = origSigJustify;
                sigSection.style.flexDirection = '';
                sigSection.style.alignItems = '';
                sigSection.style.flexShrink = '';
            }
            if (billMeta) {
                billMeta.style.display = origBMDisplay;
                billMeta.style.flexDirection = '';
                billMeta.style.justifyContent = '';
            }
            if (billForm) {
                billForm.style.display = origFormDisplay;
                billForm.style.flex = origFormFlex;
                billForm.style.flexDirection = origFormFlexDir;
            }

            procedureRows.forEach((row, idx) => {
                row.style.display = origProcRowStyles[idx].display;
                row.style.flexDirection = origProcRowStyles[idx].flexDirection;
                row.style.justifyContent = origProcRowStyles[idx].justifyContent;
                row.style.alignItems = origProcRowStyles[idx].alignItems;
            });

            if (billSpacer) {
                billSpacer.style.flex = origSpacerFlex;
                billSpacer.style.minHeight = origSpacerMinHeight;
                billSpacer.style.height = origSpacerHeight;
            }

            inputs.forEach((inp, idx) => {
                inp.style.borderBottom = savedInputStyles[idx].borderBottom;
                inp.style.background = savedInputStyles[idx].background;
            });

            if (toolbar) toolbar.style.display = origToolbarDisplay;

            allProcRows.forEach((row, idx) => {
                if (rowWasHidden[idx]) {
                    row.style.display = '';
                    row.style.height = '';
                    row.style.margin = '';
                    row.style.padding = '';
                    row.style.overflow = '';
                }
            });
            for (let i = 1; i <= 10; i++) {
                const row = document.getElementById(`procedure-row-${i}`);
                if (row) row.classList.remove('row-empty');
            }

            if (logoImg) logoImg.src = origLogoSrc;

            const fSpan = document.getElementById('billDateFormatted');
            if (fSpan) fSpan.remove();
            if (billDateInput) billDateInput.style.display = '';

            procDateInputs.forEach((inp, idx) => {
                const span = procFormattedSpans[idx];
                if (span?.parentNode) span.parentNode.removeChild(span);
                if (inp) inp.style.display = '';
            });
        };

        // ─── Capture with html2canvas → jsPDF ───
        // Bill is locked to exactly A4_W x A4_H px.
        // Canvas will be exactly one A4 page — mapped 1:1 to 210x297mm.
        try {
            const canvas = await html2canvas(bill, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                width: 794,
                windowWidth: 794,
                scrollX: 0,
                scrollY: 0,
                windowHeight: A4_H,
                height: A4_H,
                logging: false,
            });

            restoreStyles();

            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.97);
            // Canvas is exactly A4 — fill the entire page, no blank space
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            // Get patient name and sanitize it for use in filename
            const patientName = (document.getElementById('patientName') as HTMLInputElement)?.value?.trim() || 'Patient';
            const sanitizedName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

            // Build timestamp: DD-MM-YYYY_HH-MM-SS
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = now.getFullYear();
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            const timestamp = `${dd}-${mm}-${yyyy}_${hh}-${min}-${ss}`;

            const filename = `AK_Dental_${sanitizedName}_${timestamp}.pdf`;

            pdf.save(filename);
        } catch (err) {
            console.error('PDF generation failed:', err);
            restoreStyles();
        }
    };

    const clearFields = () => {
        if (window.confirm('Are you sure you want to clear all fields?')) {
            (document.getElementById('bill-form') as HTMLFormElement)?.reset();
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('billDate') as HTMLInputElement;
            if (dateInput) {
                dateInput.value = today;
            }
        }
    };

    return (
        <>
            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-brand">
                    {/* <svg viewBox="0 0 24 24"><path d="M12,22C12,22 17,20.5 19,16.5C21,12.5 19,7 19,7C19,7 18.5,3.5 15,3C11.5,2.5 12,6 12,6C12,6 12.5,2.5 9,3C5.5,3.5 5,7 5,7C5,7 3,12.5 5,16.5C7,20.5 12,22 12,22Z" /></svg> */}
                    AK MULTI SPECIALITY DENTAL CLINIC
                </div>
                <div className="action-buttons">
                    <button className="btn-primary" onClick={handlePrint} aria-label="Print Bill">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print
                    </button>
                    <button className="btn-secondary" onClick={downloadPDF} aria-label="Download PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        PDF
                    </button>
                    <button className="btn-danger" onClick={clearFields} aria-label="Clear Form">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Clear
                    </button>
                </div>
            </div>

            {/* App Shell */}
            <div className="app-shell">
                <div className="bill-container" id="bill-container" ref={billRef}>

                    {/* Header */}
                    <header className="bill-header">
                        <h1 className="clinic-name" style={{ marginBottom: '4px' }}>AK MULTI SPECIALITY DENTAL CLINIC</h1>
                        <div className="address-line" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                            #34, 2nd Avenue, 1st floor, Besant Nagar, Chennai - 600090
                        </div>
                        <div className="header-details">
                            <div className="header-left">
                                <img
                                    src="/logo.jpeg"
                                    alt="AK Dental Logo"
                                    className="clinic-logo"
                                    crossOrigin="anonymous"
                                />
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. B.V. ASHOK, MDS.,</div>
                                    <div className="doctor-title">Professor, Conservative Dentist and Endodontist.<br/>Reg. No : 7102</div>
                                </div>
                            </div>
                            <div className="header-right">
                                <div className="contact-info" style={{ marginTop: '4px' }}>Mobile: 9884310206</div>
                                <div className="contact-info" style={{ marginTop: '6px' }}>E-mail: ashokbaskaran@gmail.com</div>
                            </div>
                        </div>
                    </header>

                    <hr className="bill-divider" />

                    {/* Bill Form */}
                    <form id="bill-form" className="bill-form" onSubmit={(e) => e.preventDefault()}>

                        <div className="bill-meta">
                            <div>
                                <label htmlFor="billNo">BILL NO:-</label>
                                <input type="text" id="billNo" className="input-inline bill-no-input" placeholder="001" />
                            </div>
                            <div>
                                <label htmlFor="billDate">DATE:-</label>
                                <input type="date" id="billDate" className="input-inline date-input" />
                            </div>
                        </div>

                        <div className="patient-info">
                            This is to certify that
                            <label htmlFor="patientName" style={{ display: 'none' }}>Patient Name</label>
                            <input
                              type="text"
                              id="patientName"
                              className="input-inline patient-name-input"
                              placeholder="Patient Name"
                              onChange={(e) => autoResizeInput(e.target as HTMLInputElement)}
                              onInput={(e) => autoResizeInput(e.target as HTMLInputElement)}
                            />
                            aged
                            <label htmlFor="patientAge" style={{ display: 'none' }}>Age</label>
                            <input type="number" id="patientAge" className="input-inline age-input" placeholder="00" min="0" max="150" />
                            yrs was under my treatment for the following dental procedures
                        </div>

                        <div className="procedures-section">
                            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                                <div className="procedure-row" id={`procedure-row-${n}`} key={n}>
                                    <div className="procedure-left">
                                        <span className="proc-number" aria-hidden="true">{n}.</span>
                                        <label htmlFor={`proc${n}Name`} style={{ display: 'none' }}>Procedure {n}</label>
                                        <input type="text" id={`proc${n}Name`} className="input-inline procedure-name-input" placeholder="Procedure description" />
                                    </div>
                                    <div className="procedure-right">
                                        <label htmlFor={`proc${n}Date`}>ON</label>
                                        <input type="date" id={`proc${n}Date`} className="input-inline procedure-date-input" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Spacer — grows to fill remaining space, pushing signatures to bottom */}
                        <div className="bill-spacer"></div>

                        <div className="amount-section" style={{ marginBottom: '70px' }}>
                            I have performed the above mentioned treatment procedures with informed consent from the patient and received Rs.
                            <label htmlFor="amount" style={{ display: 'none' }}>Amount</label>
                            <input
                            type="text"
                            id="amount"
                            className="input-inline amount-input"
                            placeholder="1000"
                            style={{
                                width: '60px',
                                textAlign: 'center',
                                padding: '0 2px',
                                border: 'none',
                                borderBottom: '1px solid #000',
                                background: 'transparent'
                            }}
                            />
                            as professional charges.
                        </div>

                        <div className="signatures-section">
                            <div className="signature-box">
                                <div className="signature-line"></div>
                                <div className="signature-label">Doctor's Seal:-</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-line"></div>
                                <div className="signature-label">Doctor's Signature:</div>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}

export default App;
````

## File: src/index.css
````css
/* Removed default Vite styles to prevent conflicts with App.css */
````

## File: src/main.tsx
````typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````
## File: eslint.config.js
````javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
````

## File: index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AK Dental Billing</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: package.json
````json
{
  "name": "AK-dental-care-diagnosis-pad",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/html2canvas": "^0.5.35",
    "@types/node": "^24.12.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2",
    "vite": "^8.0.12"
  }
}
````

## File: README.md
````markdown
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
````

## File: tsconfig.app.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
````

## File: tsconfig.json
````json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
````

## File: tsconfig.node.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
````

## File: vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
````
