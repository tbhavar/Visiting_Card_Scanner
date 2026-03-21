# Google Sheets Backup Setup

This guide shows you how to connect your Card Scanner to a Google Sheet so your contacts are saved in the cloud and never lost.

## 1. Create your Google Sheet
1. Open [sheets.new](https://sheets.new) to create a new spreadsheet.
2. Name it "Card Scanner Backup".
3. (Optional) Name the first tab "Contacts".

## 2. Create the Apps Script
1. In your Google Sheet, go to **Extensions** -> **Apps Script**.
2. Delete any code in the editor and paste the following:

```javascript
/**
 * Google Sheets App Script for Card Scanner Backup
 * This script handles POST requests to Save and Load contacts.
 */

const SHEET_NAME = 'Sheet1'; // Change this if your tab is named differently
const AUTH_PASSWORD_HASH = 'cf28d56f01623c011bf817b6cbc103fc0eff415f446ac1fb05baf76e633bb016'; // PRE-FILLED HASH

function doPost(e) {
  try {
    const postData = (e && e.postData && e.postData.contents) ? e.postData.contents : null;
    if (!postData) throw new Error("No data received in post body");
    
    const request = JSON.parse(postData);
    const { action, token, data } = request;

    // Security check
    if (token !== AUTH_PASSWORD_HASH) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (action === 'sync_to_sheet') {
      // Clear sheet and rewrite with latest contacts
      sheet.clear();
      // Add Headers
      sheet.appendRow(['ID', 'Name', 'Business', 'Mobile 1', 'Mobile 2', 'Mobile 3', 'Email', 'Address', 'Notes', 'Created At']);
      
      if (data && data.length > 0) {
        data.forEach(c => {
          sheet.appendRow([
            c.id, c.personName || '', c.businessName || '', 
            c.mobile1 || '', c.mobile2 || '', c.mobile3 || '', 
            c.email || '', c.address || '', c.notes || '', c.createdAt || ''
          ]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    else if (action === 'load_from_sheet') {
      const rows = sheet.getDataRange().getValues();
      const headers = rows.shift(); // Remove headers
      const contacts = rows.map(r => ({
        id: r[0],
        personName: r[1],
        businessName: r[2],
        mobile1: r[3],
        mobile2: r[4],
        mobile3: r[5],
        email: r[6],
        address: r[7],
        notes: r[8],
        createdAt: r[9]
      }));
      
      return ContentService.createTextOutput(JSON.stringify(contacts))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Add CORS support
function doGet(e) {
  return ContentService.createTextOutput("Service is running. Use POST for data sync.");
}
```

## 3. Configure the Security Hash
In the code above, look for `YOUR_AUTH_PASSWORD_HASH_HERE`.
**Replace it with your actual password hash** (the same one you used for `AUTH_PASSWORD_HASH` in GitHub Secrets). This ensures only your app can write to your sheet.

## 4. Deploy as a Web App
1. Click the blue **Deploy** button at the top right.
2. Select **New deployment**.
3. Select type: **Web app**.
4. Description: "Card Scanner API".
5. Execute as: **Me** (your email).
6. Who has access: **Anyone** (this is safe because we check your password hash).
7. Click **Deploy**.
8. **Copy the "Web App URL"** (it looks like `https://script.google.com/macros/s/.../exec`).

## 5. Add to GitHub Secrets
1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add a new secret named: `GOOGLE_SHEETS_URL`.
3. Paste the **Web App URL** you copied in Step 4.
4. Save it.
5. Trigger a new deployment in GitHub Actions.

## 6. Using the Cloud Backup
- **Auto-Sync:** Every time you click "Save Contact", the app will automatically send the updated list to your sheet!
- **Manual Backup:** Click the **Cloud Sync** button in the Saved Contacts section.
- **Restore:** If you switch browsers or lose data, click **Restore Backup**. It will fetch your contacts from the sheet and save them back to your phone/browser.
