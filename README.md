# Starting Strength Gyms Exit Survey

A responsive web-based exit survey form for collecting member feedback to improve retention metrics.

## Features

- **Professional Design**: Styled with Starting Strength Gyms brand colors and logo
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Google Sheets Integration**: Automatically saves responses to a Google Sheet
- **Form Validation**: Ensures required fields are completed
- **User-Friendly**: Clear instructions and intuitive interface

## Setup Instructions

### 1. Google Sheets Integration

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "Starting Strength Exit Survey Responses"

2. **Set up Google Apps Script**:
   - In your Google Sheet, go to `Extensions > Apps Script`
   - Delete the default code and paste the contents of `google-apps-script.js`
   - Save the project and name it "Exit Survey Handler"

3. **Deploy as Web App**:
   - In Apps Script, click `Deploy > New deployment`
   - Choose type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone" (for form submissions)
   - Click "Deploy"
   - Copy the web app URL

4. **Update Form Handler**:
   - Open `form-handler.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your web app URL
   - Save the file

### 2. GitHub Pages Hosting

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Starting Strength Exit Survey"
   git branch -M main
   git remote add origin https://github.com/yourusername/ss-exit-survey.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: "main" / (root)
   - Save

3. **Your survey will be available at**:
   `https://yourusername.github.io/ss-exit-survey/`

### 3. Email Trigger Setup

For automated email delivery, you can:

1. **Use Google Forms Alternative**: 
   - Import the survey to Google Forms
   - Use Google Apps Script to send emails based on membership cancellation events

2. **Use Zapier/IFTTT**:
   - Connect your membership management system to trigger survey emails

3. **Custom Integration**:
   - Add webhook endpoints to your membership management system
   - Trigger email sends when members cancel

## File Structure

```
Exit_Survey/
├── index.html                 # Main survey form
├── form-handler.js           # JavaScript for form handling
├── google-apps-script.js     # Google Apps Script code
├── Memphis-3-line-black-wordmark.png  # Starting Strength logo
├── Starting Strength Gyms Brand Colors # Brand color specifications
├── Fwd_ Exit Survey.pdf      # Original survey requirements
├── CLAUDE.md                 # AI assistant context
└── README.md                # This file
```

## Survey Sections

1. **Overall Experience**: General satisfaction rating
2. **Value Perception**: Price vs value assessment
3. **Expectations**: Performance in key areas (coaching, results, facility, etc.)
4. **Additional Feedback**: Cancellation reasons, likelihood to return/refer

## Brand Colors Used

- **Blue**: #00A3E1 (Primary brand color)
- **Red**: #EE212D (Accent/CTA color) 
- **Gray**: #707372 (Secondary text)
- **Black**: #212322 (Primary text - not pure black)

## Response Data

Survey responses are automatically saved to Google Sheets with the following columns:

- Timestamp
- Overall Experience & Comments
- Value Perception & Comments  
- Expectations (5 categories)
- Cancellation Reason
- Return/Referral Likelihood
- Retention Circumstances
- Additional Comments

## Customization

To modify the survey:

1. **Add Questions**: Update the HTML form structure in `index.html`
2. **Styling**: Modify the CSS variables and styles in the `<style>` section
3. **Data Handling**: Update the Google Apps Script to handle new fields
4. **Form Validation**: Adjust validation rules in `form-handler.js`

## Testing

1. **Local Testing**: Open `index.html` in a web browser
2. **Google Apps Script Testing**: Use the `testSubmission()` function in Apps Script
3. **Form Validation**: Try submitting with missing required fields

## Support

For questions or modifications, refer to the original requirements in `Fwd_ Exit Survey.pdf` or contact the development team.