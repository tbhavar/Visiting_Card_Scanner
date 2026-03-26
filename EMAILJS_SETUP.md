# EmailJS Setup Guide

Follow these steps to configure the email feature for your Card Scanner app.

## 1. Create an EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign in (you already have an account)
2. The free plan allows **200 emails/month**

## 2. Connect Your Email (Gmail)

1. Go to **Email Services** → **Add New Service**
2. Select **Gmail**
3. Click **Connect Account** and authorize your Gmail (`your.email@gmail.com`)
4. Click **Create Service**
5. **Copy the Service ID** (e.g., `service_abc123`) — you'll need this for GitHub Secrets

## 3. Create an Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set the **Subject** to:
   ```
   Nice meeting you, {{to_name}}! — {{from_name}}
   ```
3. Set the **Content** to the HTML below:

```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
  
  <div style="background: linear-gradient(135deg, #6c63ff 0%, #e363ff 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Great connecting with you!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">{{owner_title}}</p>
  </div>
  
  <div style="padding: 30px;">
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Hi {{to_name}},
    </p>
    
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      It was wonderful meeting you{{meeting_notes}}! I wanted to reach out and share my contact details so we can stay connected.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
      <h3 style="color: #6c63ff; margin-top: 0;">My Contact Details</h3>
      <p style="margin: 8px 0; color: #555;"><strong>Name:</strong> {{from_name}}</p>
      <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> {{from_email}}</p>
      <p style="margin: 8px 0; color: #555;"><strong>Phone:</strong> {{from_phone}}</p>
      <p style="margin: 8px 0; color: #555;"><strong>Website:</strong> <a href="https://{{website_url}}" style="color: #6c63ff; text-decoration: none;">{{website_url}}</a></p>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{linkedin_url}}" style="display: inline-block; background: #0077B5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
        🔗 Connect on LinkedIn
      </a>
    </div>
    
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Looking forward to staying in touch!
    </p>
    
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Warm regards,<br>
      <strong>{{from_name}}</strong>
    </p>
  </div>
  
  <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999;">
    Sent via Card Scanner App
  </div>
</div>
```

4. In the **Settings** tab:
   - **To Email**: `{{to_email}}`
   - **From Name**: `{{from_name}}`
   - **Reply To**: `{{from_email}}`
5. Click **Save**
6. **Copy the Template ID** (e.g., `template_xyz789`)

## 4. Get Your Public Key

1. Go to **Account** → **General**  
2. Copy the **Public Key** (e.g., `user_AbCdEfGhIjKlMn`)

## 5. Configure GitHub Secrets

Go to your repository: [github.com/your-username/Visiting_Card_Scanner](https://github.com/your-username/Visiting_Card_Scanner)

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|---|---|
| `AUTH_PASSWORD_HASH` | `cf28d56f01623c011bf817b6cbc103fc0eff415f446ac1fb05baf76e633bb016` |
| `EMAILJS_PUBLIC_KEY` | Your Public Key from step 4 |
| `EMAILJS_SERVICE_ID` | Your Service ID from step 2 |
| `EMAILJS_TEMPLATE_ID` | Your Template ID from step 3 |
| `OWNER_NAME` | `Your Full Name` |
| `OWNER_EMAIL` | `your.email@gmail.com` |
| `OWNER_PHONE` | `+91 98765 43210` |
| `OWNER_LINKEDIN` | `https://www.linkedin.com/in/tbhavar/` |
| `OWNER_WEBSITE` | `tbhavar.in` |
| `OWNER_TITLE` | `Chartered Accountant | GST & Tax Consultant` |

## 6. Enable GitHub Pages

1. Go to repo **Settings** → **Pages**
2. Under **Build and deployment**, select **Source**: **GitHub Actions**
3. Push code to `main` branch — the workflow will auto-deploy

## 7. Test

1. Visit `https://your-username.github.io/Visiting_Card_Scanner/`
2. Login with your password
3. Scan a card → confirm details → click **Send Email**
4. Check the recipient's inbox!

## Template Variables Reference

| Variable | Source |
|---|---|
| `{{to_email}}` | Scanned contact's email |
| `{{to_name}}` | Scanned contact's name |
| `{{from_name}}` | `OWNER_NAME` secret |
| `{{from_email}}` | `OWNER_EMAIL` secret |
| `{{from_phone}}` | `OWNER_PHONE` secret |
| `{{linkedin_url}}` | `OWNER_LINKEDIN` secret |
| `{{website_url}}` | `OWNER_WEBSITE` secret |
| `{{owner_title}}` | `OWNER_TITLE` secret |
| `{{meeting_notes}}` | Notes field from the app |
| `{{business_name}}` | Scanned business name |
