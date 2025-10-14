# @thekzbn Library

The official frontend code for the **@thekzbn Library**, a curated digital library interface hosted at [library.thekzbn.name.ng](https://library.thekzbn.name.ng).  
This repository is provided for collaboration and improvement of the web interface.  
All books and media files are privately hosted on the author’s personal Google Drive and are not distributed through this repository.

## Overview

The @thekzbn Library is a minimalist, responsive web interface for browsing a private Drive collection.  
It uses HTML, CSS, and JavaScript only, with no build dependencies or frameworks.  
The design emphasizes clarity, speed, and ease of use.

## Purpose

This repository exists for contributors who want to:
- Improve the interface, performance, or accessibility  
- Refine visual design or usability  
- Report issues or suggest optimizations  

It is **not intended for independent hosting or reuse**.  
All Drive data is private and cannot be accessed outside the authorized domain.

## Features

- Google Drive–based folder and file browsing  
- Search and sorting by name or modification date  
- Light and dark theme toggle  
- Responsive layout with accessible markup  
- Clean, editorial-inspired design system

## API Configuration

The live site uses the Google Drive API for metadata and preview functionality.  
The production API key is restricted to `library.thekzbn.name.ng`.  
No active key is included in this repository.

To test locally, you can:
1. Create a Google Cloud project  
2. Enable the Drive API  
3. Generate a restricted API key (for example, allow `http://localhost/*`)  
4. Replace the placeholder in `assets/js/script.js`:

   ```js
   const API_KEY = 'REPLACE_WITH_YOUR_KEY';
   ```

This will enable limited testing with your own Drive data.

## Development

You can open `index.html` directly in your browser or run a local server.

Example using Node:

```bash
npx serve
```

Then visit `http://localhost:3000`.

## Contribution Guidelines

Pull requests are welcome for:

* Interface, usability, and accessibility improvements
* Code cleanup or performance optimization
* Style or layout refinement

Please do not submit or request changes related to the private Drive content or API credentials.
Focus only on front-end code and design behavior.

## License

This project is released under the MIT License.
You may study or adapt the code for learning purposes, but redistribution or hosting of the live library content is not permitted.

## Contact

For inquiries, feedback, or collaboration, visit [thekzbn.name.ng](https://thekzbn.name.ng).

## Author

Created and maintained by **@thekzbn**
Live site: [https://library.thekzbn.name.ng](https://library.thekzbn.name.ng)
