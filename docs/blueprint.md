# **App Name**: Scoutier

## Core Features:

- User Authentication: Secure user sign-up, login, and logout functionality, including password reset, handled by Firebase Authentication.
- Text Input & Email Extraction: Users can paste raw text into a designated area. The system will process this text to extract all valid email addresses, validate their format, and automatically remove any duplicates.
- Basic Entity Identification Tool: An optional tool that identifies key entities such as potential names or company information from the input text, working alongside email extraction, using a simplified generative AI model.
- Extraction History Storage: Each extraction event, including the raw input text, extracted emails, identified entities, and a timestamp, is securely stored per user in a Firestore database.
- View Extraction History: Users can access a dashboard to browse their previously saved extractions, view summary information, and click to see detailed results for each past parse.
- Extraction API Endpoint: A RESTful API endpoint (`/api/parse`) is exposed to allow the frontend to send raw text for processing and receive structured results, including extracted emails and identified entities.

## Style Guidelines:

- The primary color is a professional blue (#3A73A7), chosen to evoke reliability and data precision for a tech-focused application.
- The background color is a very light desaturated gray-blue (#F2F5F8), providing a clean, spacious canvas that complements the primary blue and enhances readability.
- An accent color of vibrant purple (#7650E5) will be used for interactive elements and key highlights, offering strong contrast and a modern touch.
- Headlines and prominent UI text will use 'Space Grotesk' (sans-serif) for its modern, technical aesthetic, while body text and data displays will utilize 'Inter' (sans-serif) for optimal legibility and clarity across various content types.
- Adopt a minimalist, line-icon style to maintain a clean and professional appearance. Icons should clearly communicate functionality without clutter.
- A clean and organized layout, featuring distinct input areas and data display sections. Prioritize responsiveness for optimal user experience across desktop and mobile, potentially using a split-panel design for efficiency.
- Implement subtle and purposeful animations for user feedback, such as loading indicators during text processing or smooth transitions when navigating through extraction history.